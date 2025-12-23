using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
