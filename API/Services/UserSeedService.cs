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
                var exists = await context.Users.AnyAsync(u => u.Id == s.Sub);
                if (exists)
                    continue;

                // Random portrait: women/0..99
                var imgNum = Random.Shared.Next(0, 100);
                var imageUrl = $"https://randomuser.me/api/portraits/women/{imgNum}.jpg";

                var appUser = new AppUser
                {
                    Id = s.Sub,
                    AuthProvider = "cognito",
                    Email = s.Email,
                    CreatedAtUtc = DateTime.Now,
                };

                var member = new Member
                {
                    Id = appUser.Id, // 1:1 mapping
                    DisplayName = s.Email.Split('@')[0],
                    ImageUrl = imageUrl,
                    OnboardingComplete = true,
                    City = "New York",
                    Country = "USA",
                    Gender = "Female",
                    Description =
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                };

                // Create a main photo record for the member
                var photo = new Photo
                {
                    Url = imageUrl,
                    S3Key = "external", // important for your CloudFront mapping logic
                    IsMain = true,
                    Member = member,
                };

                member.Photos.Add(photo);

                appUser.Member = member;

                context.Users.Add(appUser);
            }

            await context.SaveChangesAsync();
        }
    }
}
