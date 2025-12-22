using API.Entities;

namespace API.Interfaces
{
    public interface ILikesRepository
    {
        Task<MemberLike?> GetMemberLIke(string sourceMemberId, string targetMemberId);

        // Predicate will define what kind of list we want to return
        // For example the list of users the current user has liked, or been liked by, or mutual likes
        Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId);

        // This will return a list of user ids that the current user has liked
        Task<IReadOnlyList<string>> GetCurrentMemberLIkeIds(string memberId);

        void DeleteLIke(MemberLike memberLike);

        void AddLIke(MemberLike memberLike);

        Task<bool> SaveAllChanges();
    }
}
