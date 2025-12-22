using API.Entities;

namespace API.Interfaces
{
    public interface ILikesRepository
    {
        Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId);

        // Predicate will define what kind of list we want to return
        // For example the list of users the current user has liked, or been liked by, or mutual likes
        Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId);

        // This will return a list of user ids that the current user has liked
        Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId);

        void DeleteLike(MemberLike memberLike);

        void AddLike(MemberLike memberLike);

        Task<bool> SaveAllChanges();
    }
}
