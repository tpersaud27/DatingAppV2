using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class UserSeedService()
    {
        private class SeedUserRecord
        {
            public string Email { get; set; } = null!;
            public string Sub { get; set; } = null!;
        }

        public static async Task SeedUsersAsync(AppDbContext context, string seedFilePath)
        {
            // We we already have users we will just return
            if (await context.Users.AnyAsync())
            {
                return;
            }

            if (!File.Exists(seedFilePath))
                throw new FileNotFoundException($"Seed file not found: {seedFilePath}");

            var json = await File.ReadAllTextAsync(seedFilePath);
            var seedUsers =
                JsonSerializer.Deserialize<List<SeedUserRecord>>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                ) ?? [];

            foreach (var s in seedUsers)
            {
                // Skip if already exists
                var exists = await context.Users.AnyAsync(u => u.AuthUserId == s.Sub);
                if (exists)
                    continue;

                // Random portrait: women/0..99
                var imgNum = Random.Shared.Next(0, 100);
                var imageUrl = $"https://randomuser.me/api/portraits/women/{imgNum}.jpg";

                var appUser = new AppUser
                {
                    AuthProvider = "cognito",
                    AuthUserId = s.Sub,
                    Email = s.Email,
                    CreatedAtUtc = DateTime.Now,
                };

                appUser.Member = new Member
                {
                    Id = appUser.Id, // 1:1 mapping
                    DisplayName = s.Email.Split('@')[0],
                    ImageUrl = imageUrl,
                    OnboardingComplete = true,
                    City = "New York",
                    Country = "USA",
                    Gender = "Female",
                };

                context.Users.Add(appUser);
            }

            await context.SaveChangesAsync();
        }
    }
}
