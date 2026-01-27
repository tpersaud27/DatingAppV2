using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class PhotosController(
        IS3Service s3Service,
        IPhotoRepository photoRepository,
        IMemberAccessor memberAccessor
    ) : BaseApiController
    {
        [HttpPost("presign")] // api/photos/presign
        public ActionResult<S3PhotoDTO.PresignResponse> Presign(
            [FromBody] S3PhotoDTO.PresignRequest request
        )
        {
            Console.WriteLine("🧩 [Photos] Presign called");
            Console.WriteLine($"   FileName={request?.FileName}");
            Console.WriteLine($"   ContentType={request?.ContentType}");

            if (request == null)
            {
                Console.WriteLine("❌ [Photos] Presign failed: Request is required");
                return BadRequest("Request is required.");
            }

            // This endpoint does NOT upload bytes to S3.
            // It returns a pre-signed PUT URL so the client can upload directly to S3.
            var result = s3Service.GeneratePresignedUrl(request.FileName, request.ContentType);

            Console.WriteLine("✅ [Photos] Presign returning uploadUrl + fileUrl");
            return Ok(result);
        }

        // ✅ Recommended workflow:
        // 1) Client calls POST /api/photos/presign to get uploadUrl + fileUrl
        // 2) Client PUTs the file bytes directly to S3 using uploadUrl
        // 3) Client calls POST /api/photos/confirm with fileUrl (and optionally s3Key) to create the DB row
        //
        // This avoids creating DB rows for uploads that never finished.

        [HttpPost("confirm")] // api/photos/confirm
        public async Task<IActionResult> ConfirmPhoto(AddPhotoDTO addPhotoDTO)
        {
            Console.WriteLine("🧩 [Photos] ConfirmPhoto called");
            Console.WriteLine($"   Url={addPhotoDTO?.Url}");

            // The client should only call this after the PUT to S3 succeeded.
            if (string.IsNullOrWhiteSpace(addPhotoDTO?.Url))
            {
                Console.WriteLine("❌ [Photos] ConfirmPhoto failed: Url is required");
                return BadRequest("Url is required.");
            }

            // Resolve current member
            var member = await memberAccessor.GetCurrentMemberForUpdateAsync();
            var memberId = member.Id;

            Console.WriteLine($"   MemberId={memberId}");

            if (string.IsNullOrWhiteSpace(memberId))
            {
                Console.WriteLine(
                    "❌ [Photos] ConfirmPhoto failed: Unauthorized (missing member id)"
                );
                return Unauthorized();
            }

            // Extract S3 key from URL
            string s3Key;
            try
            {
                var uri = new Uri(addPhotoDTO.Url);
                // "/profile-photos/abc123.jpg" -> "profile-photos/abc123.jpg"
                s3Key = uri.AbsolutePath.TrimStart('/');
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ [Photos] ConfirmPhoto failed: invalid Url format");
                Console.WriteLine($"   Exception={ex.Message}");
                return BadRequest("Invalid Url format.");
            }

            Console.WriteLine($"   Extracted S3Key={s3Key}");

            // Create DB record
            var photo = new Photo
            {
                Url = addPhotoDTO.Url,
                S3Key = s3Key,
                MemberId = memberId,
                IsMain = false,
            };

            Console.WriteLine("💾 [Photos] Saving confirmed photo to database...");
            var savedPhoto = await photoRepository.AddPhotoAsync(photo);
            Console.WriteLine($"✅ [Photos] Photo saved. PhotoId={savedPhoto.Id}");

            // Keep your existing return shape/style
            return Ok(
                new
                {
                    savedPhoto.Id,
                    savedPhoto.Url,
                    savedPhoto.MemberId,
                    savedPhoto.IsMain,
                }
            );
        }

        [HttpDelete("{photoId:int}")] //api/photos/id
        public async Task<IActionResult> DeletePhoto(int photoId)
        {
            Console.WriteLine("🧩 [Photos] DeletePhoto called");
            Console.WriteLine($"   PhotoId={photoId}");

            var photo = await photoRepository.GetPhotoByIdAsync(photoId);
            if (photo == null)
            {
                Console.WriteLine("❌ [Photos] DeletePhoto failed: Photo not found");
                return NotFound();
            }

            Console.WriteLine($"   Photo.MemberId={photo.MemberId}");
            Console.WriteLine($"   Photo.S3Key={photo.S3Key}");
            Console.WriteLine($"   Photo.Url={photo.Url}");

            // Resolve current DB member (not Cognito sub)
            var member = await memberAccessor.GetCurrentMemberAsync();
            var currentUserId = member.Id;

            Console.WriteLine($"   CurrentUser(MemberId)={currentUserId}");

            // Ownership check
            if (photo.MemberId != currentUserId)
            {
                Console.WriteLine("⛔ [Photos] DeletePhoto forbidden: user does not own this photo");
                return Forbid();
            }

            // Delete from S3 only if S3-backed photo
            if (photo.S3Key != "external")
            {
                Console.WriteLine("🪣 [Photos] Deleting photo from S3...");
                await s3Service.DeletePhotoAsync(photo.S3Key);
                Console.WriteLine("✅ [Photos] S3 delete succeeded");
            }
            else
            {
                Console.WriteLine("ℹ️ [Photos] Skipping S3 delete (external photo)");
            }

            // Remove DB record
            Console.WriteLine("🗑️ [Photos] Removing photo record from database...");
            photoRepository.RemovePhoto(photo);

            var saved = await photoRepository.SaveAllAsync();
            Console.WriteLine($"✅ [Photos] DB delete saved={saved}");

            return NoContent();
        }

        [HttpPut("{photoId:int}/set-main")] //api/photos/id/set-main
        public async Task<IActionResult> SetMainPhoto(int photoId)
        {
            Console.WriteLine("🧩 [Photos] SetMainPhoto called");
            Console.WriteLine($"   PhotoId={photoId}");

            var member = await memberAccessor.GetCurrentMemberForUpdateAsync();
            Console.WriteLine($"   MemberId={member.Id}");

            var isMainImageSet = await photoRepository.SetMainPhotoAsync(photoId, member.Id);

            Console.WriteLine($"   SetMainPhoto result={isMainImageSet}");

            if (!isMainImageSet)
            {
                Console.WriteLine("❌ [Photos] SetMainPhoto failed");
                return BadRequest("Failed to set main photo");
            }

            Console.WriteLine("✅ [Photos] SetMainPhoto succeeded");
            return NoContent();
        }
    }
}
