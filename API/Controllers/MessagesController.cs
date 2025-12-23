using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController : BaseApiController
    {
        private readonly IMessageRepository messageRepository;
        private readonly AppDbContext context;

        public MessagesController(IMessageRepository messageRepository, AppDbContext context)
        {
            this.messageRepository = messageRepository;
            this.context = context;
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<MessageDto>> SendMessage([FromBody] CreateMessageDto dto)
        {
            var senderId = User.GetMemberId();

            var conversation = await messageRepository.GetOrCreateConversationAsync(
                senderId,
                dto.RecipientId
            );

            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = senderId,
                RecipientId = dto.RecipientId,
                Content = dto.Content,
                ClientMessageId = dto.ClientMessageId,
            };

            await messageRepository.AddMessageAsync(message);
            await messageRepository.SaveAllAsync();

            return Ok(
                new MessageDto
                {
                    Id = message.Id,
                    ConversationId = message.ConversationId,
                    SenderId = message.SenderId,
                    RecipientId = message.RecipientId,
                    Content = message.Content,
                    MessageSent = message.MessageSent,
                    DateRead = message.DateRead,
                }
            );
        }

        // GET: api/messages/conversations/{conversationId}
        [HttpGet("conversations/{conversationId:guid}")]
        public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetMessages(
            string conversationId,
            [FromQuery] int take = 20,
            [FromQuery] DateTime? before = null
        )
        {
            var userId = User.GetMemberId();

            var messages = await messageRepository.GetMessagesAsync(
                conversationId,
                userId,
                take,
                before
            );

            var result = messages.Select(m => new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                RecipientId = m.RecipientId,
                Content = m.Content,
                MessageSent = m.MessageSent,
                DateRead = m.DateRead,
            });

            return Ok(result);
        }

        // GET: api/messages/conversations
        [HttpGet("conversations")]
        public async Task<ActionResult<IReadOnlyList<Conversation>>> GetConversations()
        {
            var userId = User.GetMemberId();
            var conversations = await messageRepository.GetUserConversationsAsync(userId);

            // Collect all "other" user IDs
            var otherUserIds = conversations
                .Select(c => c.UserAId == userId ? c.UserBId : c.UserAId)
                .Distinct()
                .ToList();

            // Fetch display names in ONE query
            var users = await context
                .Members.Where(m => otherUserIds.Contains(m.Id))
                .Select(m => new { m.Id, m.DisplayName })
                .ToDictionaryAsync(m => m.Id, m => m.DisplayName);

            var result = conversations.Select(c =>
            {
                var lastMessage = c.Messages.FirstOrDefault();
                var otherUserId = c.UserAId == userId ? c.UserBId : c.UserAId;

                return new ConversationDTO
                {
                    Id = c.Id,
                    OtherUserId = otherUserId,
                    OtherUserDisplayName = users.GetValueOrDefault(otherUserId, "Unknown"),
                    LastMessage =
                        lastMessage == null
                            ? null
                            : new MessagePreviewDTO
                            {
                                Id = lastMessage.Id,
                                Content = lastMessage.Content,
                                MessageSent = lastMessage.MessageSent,
                                IsRead = lastMessage.DateRead != null,
                            },
                };
            });

            return Ok(result);
        }
    }
}
