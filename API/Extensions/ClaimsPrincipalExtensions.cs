using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst("sub")?.Value
                ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new Exception("User id (sub) claim not found");
        }
    }
}
