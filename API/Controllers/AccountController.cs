using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController(
        AppDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration config
    ) : BaseApiController
    {
        [Authorize]
        [HttpPost("bootstrap")] // api/acount/bootstrap
        public async Task<ActionResult<UserDTO>> Bootstrap()
        {
            try
            {
                Console.WriteLine("🧩 Bootstrap endpoint called");
                Console.WriteLine($"Authenticated={User?.Identity?.IsAuthenticated}");

                var subClaim =
                    User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                Console.WriteLine($"sub={subClaim ?? "(null)"}");

                var authHeader = Request.Headers.Authorization.ToString();
                Console.WriteLine(
                    $"HasAuthorizationHeader={!string.IsNullOrWhiteSpace(authHeader)}"
                );
                Console.WriteLine(
                    $"AuthorizationHeaderPrefix={(authHeader?.Length > 15 ? authHeader[..15] : authHeader)}"
                );

                // 1) Cognito user id (sub)
                var sub = subClaim;
                if (string.IsNullOrWhiteSpace(sub))
                    return Unauthorized("Missing sub claim");

                // 2) Access token
                var accessToken =
                    !string.IsNullOrWhiteSpace(authHeader)
                    && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                        ? authHeader["Bearer ".Length..].Trim()
                        : null;

                // 3) Best-effort email from JWT
                var email =
                    User != null
                        ? (
                            User.FindFirst("email")?.Value
                            ?? User.FindFirst(ClaimTypes.Email)?.Value
                        )
                        : null;
                Console.WriteLine($"email(from token)={email ?? "(null)"}");

                // 4) Determine provider using Cognito userInfo
                var provider = "cognito";
                if (!string.IsNullOrWhiteSpace(accessToken))
                {
                    Console.WriteLine("Calling TryGetUserInfo...");
                    var (userInfoEmail, userInfoProvider) = await TryGetUserInfo(accessToken);
                    Console.WriteLine(
                        $"userInfoEmail={userInfoEmail ?? "(null)"} userInfoProvider={userInfoProvider ?? "(null)"}"
                    );

                    email ??= userInfoEmail;
                    if (!string.IsNullOrWhiteSpace(userInfoProvider))
                        provider = userInfoProvider;
                }
                else
                {
                    Console.WriteLine(
                        "No access token found in Authorization header (not Bearer?)"
                    );
                }

                // 5) Load user by AuthUserId
                Console.WriteLine("Querying user from DB...");
                var user = await context
                    .Users.Include(u => u.Member)
                    .SingleOrDefaultAsync(u => u.Id == sub);

                if (user == null)
                {
                    Console.WriteLine("User not found; creating user + member...");

                    user = new AppUser
                    {
                        Id = sub,
                        AuthProvider = provider,
                        Email = email,
                    };

                    user.Member = new Member
                    {
                        DisplayName = email?.Split('@')[0] ?? "New User",
                        OnboardingComplete = false,
                        LastActive = DateTime.UtcNow,
                    };

                    context.Users.Add(user);

                    Console.WriteLine("Saving changes...");
                    await context.SaveChangesAsync();
                    Console.WriteLine("User created.");
                }
                else
                {
                    Console.WriteLine("User found; updating...");

                    user.AuthProvider = provider;

                    if (!string.IsNullOrWhiteSpace(email) && user.Email != email)
                        user.Email = email;

                    if (user.Member != null)
                        user.Member.LastActive = DateTime.UtcNow;

                    Console.WriteLine("Saving changes...");
                    await context.SaveChangesAsync();
                    Console.WriteLine("User updated.");
                }

                return Ok(
                    new UserDTO
                    {
                        Id = user.Id,
                        AuthProvider = user.AuthProvider,
                        Email = user.Email,
                        DisplayName = user.Member?.DisplayName,
                        OnboardingComplete = user.Member?.OnboardingComplete ?? false,
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine("🔥 Bootstrap failed:");
                Console.WriteLine(ex.ToString()); // includes stack trace
                throw; // lets your ExceptionMiddleware still format the 500 response
            }
        }

        [Authorize]
        [HttpPut("onboarding")] // PUT api/account/onboarding
        public async Task<ActionResult> CompleteOnboarding(OnboardingDTO dto)
        {
            // 1) Get Cognito user id (sub)
            var sub =
                User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(sub))
            {
                return Unauthorized("Missing sub claim");
            }

            // 2) Load user + member
            var user = await context
                .Users.Include(u => u.Member)
                .SingleOrDefaultAsync(u => u.Id == sub);

            if (user == null)
            {
                return NotFound("User not found. Call /bootstrap first.");
            }

            if (user.Member == null)
            {
                return BadRequest("User profile not initialized.");
            }

            // 3) Update profile fields
            user.Member.DisplayName = dto.DisplayName;
            user.Member.Gender = dto.Gender;
            user.Member.DateOfBirth = dto.DateOfBirth;
            user.Member.City = dto.City;
            user.Member.Country = dto.Country;
            user.Member.Description = dto.Description;

            // 4) Mark onboarding complete
            user.Member.OnboardingComplete = true;
            user.Member.LastActive = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<(string? Email, string? Provider)> TryGetUserInfo(string accessToken)
        {
            var domain = config["Cognito:Domain"]; // e.g. https://dating-app-v2-auth.auth.us-east-1.amazoncognito.com
            if (string.IsNullOrWhiteSpace(domain))
                return (null, null);

            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                accessToken
            );

            var url = $"{domain}/oauth2/userInfo";
            var json = await client.GetStringAsync(url);

            using var doc = JsonDocument.Parse(json);

            string? email = null;
            if (doc.RootElement.TryGetProperty("email", out var emailProp))
                email = emailProp.GetString();

            // Provider detection is not always present; best-effort:
            // Some Cognito userInfo responses include an "identities" array for federated users.
            // We'll try to read it if it exists.
            string? provider = null;

            if (
                doc.RootElement.TryGetProperty("identities", out var identitiesProp)
                && identitiesProp.ValueKind == JsonValueKind.Array
                && identitiesProp.GetArrayLength() > 0
            )
            {
                var first = identitiesProp[0];
                if (first.TryGetProperty("providerName", out var providerNameProp))
                    provider = providerNameProp.GetString();
            }

            // Normalize common names (optional)
            provider = provider?.ToLowerInvariant() switch
            {
                "google" => "google",
                "signinwithapple" => "apple",
                "facebook" => "facebook",
                _ => provider,
            };

            return (email, provider);
        }

        // NO LONGER USER. REGISTRATION IS DONE VIA AWS COGNITO

        // [HttpPost("register")] // api/account/register
        // public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
        // {
        //     if (await DoesEmailExist(registerDTO.Email))
        //     {
        //         return BadRequest("Email taken!");
        //     }

        //     // They keyword 'using' will dispose of this when we a finished using it.
        //     // This is better than waiting for garbage collection to clean up at a future time
        //     using var hmac = new HMACSHA512();

        //     // This is creating a new user
        //     var user = new AppUser
        //     {
        //         DisplayName = registerDTO.DisplayName,
        //         Email = registerDTO.Email,
        //         PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
        //         PasswordSalt = hmac.Key,

        //         // We also need to create a new member as well
        //         Member = new Member
        //         {
        //             DisplayName = registerDTO.DisplayName,
        //             DateOfBirth = registerDTO.DateOfBirth,
        //             Gender = registerDTO.Gender,
        //             City = registerDTO.City,
        //             Country = registerDTO.Country,
        //         },
        //     };

        //     context.Users.Add(user);
        //     await context.SaveChangesAsync();

        //     return user.ConvertAppUserToUserDto(tokenService);
        // }

        //     [HttpPost("login")] //api/account/login
        //     public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
        //     {
        //         // Check if user exists
        //         var user = await context.Users.SingleOrDefaultAsync(user =>
        //             user.Email == loginDto.Email
        //         );

        //         if (user == null)
        //         {
        //             return Unauthorized("Invalid email address");
        //         }

        //         using var hmac = new HMACSHA512(user.PasswordSalt);
        //         var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        //         for (var i = 0; i < computedHash.Length; i++)
        //         {
        //             if (computedHash[i] != user.PasswordHash[i])
        //             {
        //                 return Unauthorized("Invalid password");
        //             }
        //         }
        //         return user.ConvertAppUserToUserDto(tokenService);
        //     }

        //     private async Task<bool> DoesEmailExist(string email)
        //     {
        //         return await context.Users.AnyAsync(user => user.Email.ToLower() == email.ToLower());
        //     }
    }
}
