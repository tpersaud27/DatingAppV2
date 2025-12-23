namespace API.Entities
{
    public class Message
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Conversation (1:1 only)
        public required string ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;

        // Message content
        public required string Content { get; set; }

        // Timestamps
        public DateTime MessageSent { get; set; } = DateTime.UtcNow;
        public DateTime? DateRead { get; set; }

        // Soft delete flags (per user)
        public bool SenderDeleted { get; set; }
        public bool RecipientDeleted { get; set; }

        // Navigation Properties
        // Navigation properties are object-level references that let one entity navigate to related entities without writing joins manually.
        public required string SenderId { get; set; }
        public Member Sender { get; set; } = null!;
        public required string RecipientId { get; set; } = null!;
        public Member Recipient { get; set; } = null!;

        // Idempotency for retries (AWS-safe)
        public string? ClientMessageId { get; set; }
    }
}
