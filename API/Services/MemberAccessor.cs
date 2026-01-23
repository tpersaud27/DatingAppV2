using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Extensions;
using API.Interfaces;

namespace API.Services
{
    public class MemberAccessor(
        IHttpContextAccessor httpContextAccessor,
        IMemberRepository memberRepository
    ) : IMemberAccessor
    {
        public async Task<Member> GetCurrentMemberAsync()
        {
            var user =
                httpContextAccessor.HttpContext?.User
                ?? throw new UnauthorizedAccessException("No user context");

            var authUserId = user.GetAuthUserId();

            var member = await memberRepository.GetMemberByAuthUserIdAsync(authUserId);

            return member ?? throw new InvalidOperationException("Member not found");
        }

        public async Task<Member> GetCurrentMemberForUpdateAsync()
        {
            var user =
                httpContextAccessor.HttpContext?.User
                ?? throw new UnauthorizedAccessException("No user context");

            var authUserId = user.GetAuthUserId();

            var member = await memberRepository.GetMemberForUpdateByAuthUserId(authUserId);

            return member ?? throw new InvalidOperationException("Member not found");
        }
    }
}
