namespace API.DTOs
{
    public class S3PhotoDTO
    {
        public record PresignRequest(string FileName, string ContentType);

        public record PresignResponse(string UploadUrl, string FileUrl);
    }
}
