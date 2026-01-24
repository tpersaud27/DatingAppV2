using API.Entities;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        // Creates a conversations (1 to 1 communication thread) between two users
        Task<Conversation> GetOrCreateConversationAsync(string userId, string otherUserId);

        // Persists message to DB
        Task<Message> AddMessageAsync(Message message);

        // Returns messages in a conversation
        Task<IReadOnlyList<Message>> GetMessagesAsync(
            string conversationId,
            string currentUserId,
            int take,
            DateTime? before
        );

        // Returns all user conversations
        Task<IReadOnlyList<Conversation>> GetUserConversationsAsync(string userId);

        // Saves DB changes
        Task<bool> SaveAllAsync();

        // Checks if message already exists so duplicate messages are not persisted
        Task<Message?> GetMessageByClientMessageIdAsync(
            string conversationId,
            string clientMessageId
        );
    }
}
