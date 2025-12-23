namespace API.Entities
{
    public class Message
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Content { get; set; }
        public DateTime? DateRead { get; set; }
        public DateTime MessageSent { get; set; }
        public bool SenderDeleted { get; set; }
        public bool RecipeientDeleted { get; set; }

        // Navigation Properties
        // Navigation properties are object-level references that let one entity navigate to related entities without writing joins manually.
        public required string SenderId { get; set; }
        public Member Sender { get; set; } = null!;
        public required string RecipientId { get; set; } = null!;
        public Member Recipient { get; set; } = null!;
    }
}
