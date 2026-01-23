using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MemberRepository(AppDbContext context) : IMemberRepository
    {
        public async Task<Member?> GetMemberByIdAsync(string id)
        {
            return await context.Members.FindAsync(id);
        }

        // This will be used for getting the member when we need to update other entities like AppUser
        public async Task<Member?> GetMemberForUpdate(string id)
        {
            // This will also return for us the User object for us
            return await context.Members.Include(x => x.User).SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IReadOnlyList<Member>> GetMembersAsync()
        {
            return await context.Members.ToListAsync();
        }

        public async Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId)
        {
            return await context
                .Members.Where(member => member.Id == memberId)
                .SelectMany(x => x.Photos)
                .ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public void Update(Member member)
        {
            context.Entry(member).State = EntityState.Modified;
        }

        public async Task<Member?> GetMemberForUpdateByAuthUserId(string authUserId)
        {
            return await context
                .Members.Include(x => x.User)
                .SingleOrDefaultAsync(x => x.User.AuthUserId == authUserId);
        }

        public Task<Member?> GetMemberByAuthUserIdAsync(string authUserId)
        {
            return context
                .Members.AsNoTracking() // No tracking just retrieving
                .SingleOrDefaultAsync(m => m.User.AuthUserId == authUserId);
        }
    }
}
