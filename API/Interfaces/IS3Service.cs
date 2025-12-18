using API.DTOs;

namespace API.Interfaces
{
    public interface IS3Service
    {
        S3PhotoDTO.PresignResponse GeneratePresignedUrl(string fileName, string contentType);
        Task DeletePhotoAsync(string s3Key);
    }
}
