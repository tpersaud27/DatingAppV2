using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Extensions
{
    public static class AppUserExtensions
    {
        public static UserDTO ConvertAppUserToUserDto(this AppUser user, ITokenService tokenService)
        {
            return new UserDTO
            {
                Id = user.Id,
                AuthUserId = user.AuthUserId,
                AuthProvider = user.AuthProvider,
                Email = user.Email,
                DisplayName = user.Member?.DisplayName,
                OnboardingComplete = user.Member?.OnboardingComplete ?? false,
            };
        }
    }
}
