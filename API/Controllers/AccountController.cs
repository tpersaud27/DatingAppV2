using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController(AppDbContext context) : BaseApiController
    {
        [HttpPost("register")] // api/account/register
        public async Task<ActionResult<AppUser>> Register(RegisterDTO registerDTO)
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

            return user;
        }

        private async Task<Boolean> DoesEmailExist(string email)
        {
            return await context.Users.AnyAsync(user => user.Email.ToLower() == email.ToLower());
        }
    }
}
