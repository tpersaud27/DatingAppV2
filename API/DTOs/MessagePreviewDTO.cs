namespace API.DTOs
{
    public class MessagePreviewDTO
    {
        public string Id { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime MessageSent { get; set; }
        public bool IsRead { get; set; }
    }
}
