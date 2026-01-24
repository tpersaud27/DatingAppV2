using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueClientMessageIdToMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "UX_Messages_Conversation_ClientMessageId",
                table: "Messages",
                columns: new[] { "ConversationId", "ClientMessageId" },
                unique: true,
                filter: "[ClientMessageId] IS NOT NULL"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Messages_Conversation_ClientMessageId",
                table: "Messages"
            );
        }
    }
}
