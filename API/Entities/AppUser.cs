namespace API.Entities
{
    public class AppUser
    {
        // Primary key in our database (this is the cognito sub)
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Auth provider (google, cognito, apple, etc.)
        public string? AuthProvider { get; set; }

        // Email is useful but not authoritative
        public string? Email { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        // Navigation property (1:1)
        public Member? Member { get; set; }
    }
}
