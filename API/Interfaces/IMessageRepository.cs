using API.Entities;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        Task<Conversation> GetOrCreateConversationAsync(string userId, string otherUserId);
        Task<Message> AddMessageAsync(Message message);
        Task<IReadOnlyList<Message>> GetMessagesAsync(
            string conversationId,
            string currentUserId,
            int take,
            DateTime? before
        );
        Task<IReadOnlyList<Conversation>> GetUserConversationsAsync(string userId);
        Task<bool> SaveAllAsync();
    }
}
