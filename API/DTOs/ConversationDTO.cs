namespace API.DTOs
{
    public class ConversationDTO
    {
        public string Id { get; set; } = null!;
        public string OtherUserId { get; set; } = null!;
        public string OtherUserDisplayName { get; set; } = null!;
        public MessagePreviewDTO? LastMessage { get; set; }
    }
}
