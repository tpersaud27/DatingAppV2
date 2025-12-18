using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class PhotosController(IS3Service s3Service) : BaseApiController
    {
        [HttpPost("presign")] // api/photos/presign
        public ActionResult<S3PhotoDTO.PresignResponse> Presign(
            [FromBody] S3PhotoDTO.PresignRequest request
        )
        {
            var result = s3Service.GeneratePresignedUrl(request.FileName, request.ContentType);

            return Ok(result);
        }
    }
}
