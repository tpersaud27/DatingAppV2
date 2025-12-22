using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        public void AddLIke(MemberLike memberLike)
        {
            throw new NotImplementedException();
        }

        public void DeleteLIke(MemberLike memberLike)
        {
            throw new NotImplementedException();
        }

        public Task<IReadOnlyList<string>> GetCurrentMemberLIkeIds(string memberId)
        {
            throw new NotImplementedException();
        }

        public Task<MemberLike> GetMemberLIke(string sourceMemberId, string targetMemberId)
        {
            throw new NotImplementedException();
        }

        public Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SaveAllChanges()
        {
            throw new NotImplementedException();
        }
    }
}
