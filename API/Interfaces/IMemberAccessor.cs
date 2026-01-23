using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.Services
{
    public interface IMemberAccessor
    {
        Task<Member> GetCurrentMemberForUpdateAsync();
        Task<Member> GetCurrentMemberAsync();
    }
}
