using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class PhotosController(IS3Service s3Service) : BaseApiController
    {
        [HttpPost("presign")]
        public ActionResult<S3PhotoDTO.PresignResponse> Presign(
            [FromBody] S3PhotoDTO.PresignRequest request
        )
        {
            var result = s3Service.GeneratePresignedUrl(request.FileName, request.ContentType);

            return Ok(result);
        }
    }
}
