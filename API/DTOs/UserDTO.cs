namespace API.DTOs
{
    public class UserDTO
    {
        public string Id { get; set; } = null!;
        public string? AuthProvider { get; set; }
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public bool OnboardingComplete { get; set; }
    }
}
