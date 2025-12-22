using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class LikesRepository(AppDbContext context) : ILikesRepository
    {
        public void AddLIke(MemberLike memberLike)
        {
            context.Likes.Add(memberLike);
        }

        public void DeleteLIke(MemberLike memberLike)
        {
            context.Likes.Remove(memberLike);
        }

        public async Task<IReadOnlyList<string>> GetCurrentMemberLIkeIds(string memberId)
        {
            // We query our likes table based on our sourceMemberId (this is our current user)
            // We get our list of likes from the current user which is our targetMemberId
            // We then return a list of the targetMemberIds (the people the current user likes)
            return await context
                .Likes.Where(x => x.SourceMemberId == memberId)
                .Select(x => x.TargetMemberId)
                .ToListAsync();
        }

        public async Task<MemberLike?> GetMemberLIke(string sourceMemberId, string targetMemberId)
        {
            // This returns the MemberLike object based on the sourceMemberId and targetMemberId
            return await context.Likes.FindAsync(sourceMemberId, targetMemberId);
        }

        public async Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId)
        {
            var likesQuery = context.Likes.AsQueryable();

            switch (predicate)
            {
                case "likedBy":
                    // This returns a list of members that have liked the current user
                    return await likesQuery
                        .Where(x => x.TargetMemberId == memberId)
                        .Select(x => x.SourceMember)
                        .ToListAsync();
                case "liked":
                    // This returns a list of members that the current user has liked
                    return await likesQuery
                        .Where(x => x.SourceMemberId == memberId)
                        .Select(x => x.TargetMember)
                        .ToListAsync();
                default: // mutual case
                    // list of the members that both the current user and the target user have liked
                    // This gets us the list of people that the current user likes
                    var likeIds = await GetCurrentMemberLIkeIds(memberId);
                    return await likesQuery
                        .Where(x =>
                            // Here we also get the list of people that the target user likes
                            x.TargetMemberId == memberId
                            && likeIds.Contains(x.SourceMemberId)
                        )
                        // We then return the list of people that both the current user and the target user have liked
                        .Select(x => x.SourceMember)
                        .ToListAsync();
            }
        }

        public async Task<bool> SaveAllChanges()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}
