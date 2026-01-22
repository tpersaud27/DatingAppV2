using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities
{
    public class Member
    {
        // 1:1 relationship with AppUser
        public string Id { get; set; } = null!; // FK to AppUser.Id
        public DateOnly? DateOfBirth { get; set; }
        public string? ImageUrl { get; set; }
        public required string DisplayName { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime LastActive { get; set; } = DateTime.UtcNow;
        public string? Gender { get; set; }
        public string? Description { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public bool OnboardingComplete { get; set; } = false;

        // Navigation Properties
        [JsonIgnore]
        public List<Photo> Photos { get; set; } = [];

        [JsonIgnore]
        [ForeignKey(nameof(Id))]
        public AppUser User { get; set; } = null!;

        // List of users who like the current user
        [JsonIgnore]
        public List<MemberLike> LikedByMembers { get; set; } = [];

        // List of users the current user likes
        [JsonIgnore]
        public List<MemberLike> LikedMembers { get; set; } = [];

        // List of MessagesSent by the current user
        [JsonIgnore]
        public List<Message> MessagesSent { get; set; } = [];

        // LIst of MessagesReceived by the current user
        [JsonIgnore]
        public List<Message> MessagesReceived { get; set; } = [];
    }
}
