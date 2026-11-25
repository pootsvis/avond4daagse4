using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerAccountAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BeschikbaarheidJson",
                table: "Vrijwilligers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "GebruikerId",
                table: "Vrijwilligers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vrijwilligers_GebruikerId",
                table: "Vrijwilligers",
                column: "GebruikerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Vrijwilligers_Gebruikers_GebruikerId",
                table: "Vrijwilligers",
                column: "GebruikerId",
                principalTable: "Gebruikers",
                principalColumn: "GebruikerId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vrijwilligers_Gebruikers_GebruikerId",
                table: "Vrijwilligers");

            migrationBuilder.DropIndex(
                name: "IX_Vrijwilligers_GebruikerId",
                table: "Vrijwilligers");

            migrationBuilder.DropColumn(
                name: "BeschikbaarheidJson",
                table: "Vrijwilligers");

            migrationBuilder.DropColumn(
                name: "GebruikerId",
                table: "Vrijwilligers");
        }
    }
}
