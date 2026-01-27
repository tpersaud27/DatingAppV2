using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        // This DbSet represents our table in the Database
        public DbSet<AppUser> Users { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<MemberLike> Likes { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AppUser Id should not be auto generated, should come from Cognito sub
            modelBuilder.Entity<AppUser>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.Id).ValueGeneratedNever(); // key: important
                b.HasIndex(u => u.Id).IsUnique();
            });

            // ==========================
            // Conversation (1:1)
            // ==========================

            modelBuilder
                .Entity<Conversation>()
                .HasIndex(c => new { c.UserAId, c.UserBId })
                .IsUnique();

            // ==========================
            // Message Relationships
            // ==========================

            // Sender → MessagesSent (NO cascade)
            modelBuilder
                .Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.MessagesSent)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Recipient → MessagesReceived (NO cascade)
            modelBuilder
                .Entity<Message>()
                .HasOne(m => m.Recipient)
                .WithMany(u => u.MessagesReceived)
                .HasForeignKey(m => m.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Conversation → Messages (NO cascade)
            modelBuilder
                .Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================
            // Message Indexes
            // ==========================

            modelBuilder
                .Entity<Message>()
                .HasIndex(m => new { m.ConversationId, m.MessageSent });

            modelBuilder
                .Entity<Message>()
                .HasIndex(m => new { m.SenderId, m.ClientMessageId })
                .IsUnique()
                .HasFilter(@"""ClientMessageId"" IS NOT NULL");

            // ==========================
            // Member Likes
            // ==========================

            // This will set the primary key for the MemberLike table to be a combination of the SourceMemberId and TargetMemberId
            modelBuilder
                .Entity<MemberLike>()
                .HasKey(x => new { x.SourceMemberId, x.TargetMemberId });

            // This is telling EF that one SourceMember can have many LikedMembers
            // And the foreign key in our MemberLike table is our SourceMemberId
            // And if a SourceMember is deleted, we want to delete all the likes that they have given
            modelBuilder
                .Entity<MemberLike>()
                .HasOne(x => x.SourceMember)
                .WithMany(x => x.LikedMembers)
                .HasForeignKey(x => x.SourceMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            // This is telling EF that one TargetMember can have many LikedByMembers
            modelBuilder
                .Entity<MemberLike>()
                .HasOne(x => x.TargetMember)
                .WithMany(x => x.LikedByMembers)
                .HasForeignKey(x => x.TargetMemberId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
