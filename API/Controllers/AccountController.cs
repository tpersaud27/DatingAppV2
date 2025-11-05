using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController(AppDbContext context, ITokenService tokenService)
        : BaseApiController
    {
        [HttpPost("register")] // api/account/register
        public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
        {
            if (await DoesEmailExist(registerDTO.Email))
            {
                return BadRequest("Email taken!");
            }

            // They keyword 'using' will dispose of this when we a finished using it.
            // This is better than waiting for garbage collection to clean up at a future time
            using var hmac = new HMACSHA512();

            var user = new AppUser
            {
                DisplayName = registerDTO.DisplayName,
                Email = registerDTO.Email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
                PasswordSalt = hmac.Key,
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return new UserDTO
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Token = tokenService.CreateToken(user),
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
        {
            // Check if user exists
            var user = await context.Users.SingleOrDefaultAsync(user =>
                user.Email == loginDto.Email
            );

            if (user == null)
            {
                return Unauthorized("Invalid email address");
            }

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                {
                    return Unauthorized("Invalid password");
                }
            }
            return new UserDTO
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Token = tokenService.CreateToken(user),
            };
        }

        private async Task<Boolean> DoesEmailExist(string email)
        {
            return await context.Users.AnyAsync(user => user.Email.ToLower() == email.ToLower());
        }
    }
}
