namespace API.Entities
{
    public class Conversation
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Exactly two users, always
        public required string UserAId { get; set; }
        public required string UserBId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<Message> Messages { get; set; } = [];
    }
}
