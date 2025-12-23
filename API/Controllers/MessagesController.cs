using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController(IMessageRepository messageRepository) : BaseApiController
    {
        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<MessageDto>> SendMessage(CreateMessageDto dto)
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
        [HttpGet("conversations/{conversationId}")]
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

            var result = conversations.Select(c =>
            {
                var lastMessage = c.Messages.FirstOrDefault();

                var otherUserId = c.UserAId == userId ? c.UserBId : c.UserAId;

                return new ConversationDTO
                {
                    Id = c.Id,
                    OtherUserId = otherUserId,
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
