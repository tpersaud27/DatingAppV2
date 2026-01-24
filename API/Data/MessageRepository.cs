using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository(AppDbContext context) : IMessageRepository
    {
        // Ensures exactly ONE conversation per user pair
        public async Task<Conversation> GetOrCreateConversationAsync(
            string userId,
            string otherUserId
        )
        {
            var (userA, userB) = SortUsers(userId, otherUserId);

            var conversation = await context.Conversations.FirstOrDefaultAsync(c =>
                c.UserAId == userA && c.UserBId == userB
            );

            if (conversation != null)
                return conversation;

            conversation = new Conversation { UserAId = userA, UserBId = userB };

            context.Conversations.Add(conversation);
            return conversation;
        }

        // Adds message with idempotency support
        public async Task<Message> AddMessageAsync(Message message)
        {
            if (!string.IsNullOrEmpty(message.ClientMessageId))
            {
                var existing = await context.Messages.FirstOrDefaultAsync(m =>
                    m.SenderId == message.SenderId && m.ClientMessageId == message.ClientMessageId
                );

                if (existing != null)
                    return existing;
            }

            context.Messages.Add(message);
            return message;
        }

        // Cursor-based pagination + per-user soft deletes
        public async Task<IReadOnlyList<Message>> GetMessagesAsync(
            string conversationId,
            string userId,
            int take,
            DateTime? before
        )
        {
            IQueryable<Message> query = context
                .Messages.Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.MessageSent);

            if (before.HasValue)
            {
                query = query.Where(m => m.MessageSent < before.Value);
            }

            // 1️⃣ Get newest messages
            var messages = await query.Take(take).ToListAsync();

            // 2️⃣ Reverse so UI gets oldest → newest
            messages.Reverse();

            return messages;
        }

        // Inbox / conversation list
        public async Task<IReadOnlyList<Conversation>> GetUserConversationsAsync(string userId)
        {
            return await context
                .Conversations.Include(c =>
                    c.Messages.OrderByDescending(m => m.MessageSent).Take(1)
                )
                .Where(c => c.UserAId == userId || c.UserBId == userId)
                .OrderByDescending(c => c.Messages.Max(m => m.MessageSent))
                .ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        private static (string, string) SortUsers(string a, string b)
        {
            return string.CompareOrdinal(a, b) < 0 ? (a, b) : (b, a);
        }

        public async Task<Message?> GetMessageByClientMessageIdAsync(
            string conversationId,
            string clientMessageId
        )
        {
            return await context
                .Messages.AsNoTracking()
                .SingleOrDefaultAsync(m =>
                    m.ConversationId == conversationId && m.ClientMessageId == clientMessageId
                );
        }
    }
}
