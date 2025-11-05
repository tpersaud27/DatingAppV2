using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static async Task<WebApplication> MigrateAndSeedDatabaseAsync(
            this WebApplication app
        )
        {
            // Service Locator Pattern
            // This code is manually asking the dependency injection container for a service instance, in this case the AppDbContext
            // Since we need to run the code during application startup for seeding data, we can do this
            using var scope = app.Services.CreateScope(); // This simulates a request so the DI container knows how to create scoped services
            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<AppDbContext>(); // This is pulling the dependency manually
                await context.Database.MigrateAsync();
                await Seed.SeedUsers(context);
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occured during migration");
            }

            return app; // allows chaining in Program.cs
        }
    }
}
