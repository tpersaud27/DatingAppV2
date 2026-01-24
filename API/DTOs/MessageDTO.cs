namespace API.DTOs
{
    public class MessageDto
    {
        public string Id { get; set; } = null!;
        public string ConversationId { get; set; } = null!;
        public string SenderId { get; set; } = null!;
        public string RecipientId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime MessageSent { get; set; }
        public DateTime? DateRead { get; set; }

        // Temporary, client-generated unique ID for message
        // Messages can get sent more than once, this prevents sending duplicate messages
        public string? ClientMessageId { get; set; }
    }
}
