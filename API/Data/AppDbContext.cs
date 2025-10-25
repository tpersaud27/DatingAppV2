using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        // This DbSet represents our table in the Database
        public DbSet<AppUser> Users { get; set; }
    }
}
