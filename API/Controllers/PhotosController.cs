using Amazon.SecurityToken;
using Amazon.SecurityToken.Model;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class PhotosController(IS3Service s3Service, IPhotoRepository photoRepository)
        : BaseApiController
    {
        [HttpPost("presign")] // api/photos/presign
        public ActionResult<S3PhotoDTO.PresignResponse> Presign(
            [FromBody] S3PhotoDTO.PresignRequest request
        )
        {
            var result = s3Service.GeneratePresignedUrl(request.FileName, request.ContentType);

            return Ok(result);
        }

        [HttpPost] //api/photos
        public async Task<IActionResult> AddPhoto(AddPhotoDTO addPhotoDTO)
        {
            if (string.IsNullOrWhiteSpace(addPhotoDTO.Url))
            {
                return BadRequest("Url is required.");
            }

            // We need to add the Photo URl to the Member's Photos collection
            var memberId = User.GetMemberId();

            if (string.IsNullOrWhiteSpace(memberId))
            {
                return Unauthorized();
            }

            // Extract S3 key from URL
            var uri = new Uri(addPhotoDTO.Url);
            // "/profile-photos/abc123.jpg"
            var s3Key = uri.AbsolutePath.TrimStart('/');

            // This is the new photo entity we will add
            var photo = new Photo
            {
                Url = addPhotoDTO.Url,
                S3Key = s3Key,
                MemberId = memberId,
            };

            var savedPhoto = await photoRepository.AddPhotoAsync(photo);

            return Ok(
                new
                {
                    savedPhoto.Id,
                    savedPhoto.Url,
                    savedPhoto.MemberId,
                }
            );
        }

        [HttpDelete("{photoId:int}")]
        public async Task<IActionResult> DeletePhoto(int photoId)
        {
            var photo = await photoRepository.GetPhotoByIdAsync(photoId);
            if (photo == null)
                return NotFound();

            // 🔐 Ownership check
            var currentUserId = User.GetMemberId();
            if (photo.MemberId != currentUserId)
                return Forbid();

            // 🪣 Only delete from S3 if it’s an S3-backed photo
            if (photo.S3Key != "external")
            {
                await s3Service.DeletePhotoAsync(photo.S3Key);
            }

            // 🗑 Remove DB record
            photoRepository.RemovePhoto(photo);
            await photoRepository.SaveAllAsync();

            return NoContent();
        }
    }
}
