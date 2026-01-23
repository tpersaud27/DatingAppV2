using System.Text.Json.Serialization;

namespace API.Entities
{
    public class Photo
    {
        public int Id { get; set; }
        public required string Url { get; set; }

        public required bool IsMain { get; set; }

        // Required for S3 Delete
        public required string S3Key { get; set; }
        public string? PublicId { get; set; }

        // Navigation Property
        [JsonIgnore]
        public Member Member { get; set; } = null!;
        public string MemberId { get; set; } = null!;
    }
}
