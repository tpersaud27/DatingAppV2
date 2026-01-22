namespace API.DTOs
{
    public class OnboardingDTO
    {
        public required string DisplayName { get; set; }
        public required string Gender { get; set; }
        public required DateOnly DateOfBirth { get; set; }
        public required string City { get; set; }
        public required string Country { get; set; }
        public string? Description { get; set; }
    }
}
