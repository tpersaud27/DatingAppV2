using API.Entities;

namespace API.Interfaces
{
    public interface IMemberRepository
    {
        void Update(Member member);
        Task<bool> SaveAllAsync();
        Task<IReadOnlyList<Member>> GetMembersAsync();
        Task<Member?> GetMemberByIdAsync(string id);
        Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId);
        Task<Member?> GetMemberForUpdate(string id);

        // Entity tracked for update here
        Task<Member?> GetMemberForUpdateByAuthUserId(string authUserId);

        // Entity not tracked for update here
        Task<Member?> GetMemberByAuthUserIdAsync(string authUserId);
    }
}
