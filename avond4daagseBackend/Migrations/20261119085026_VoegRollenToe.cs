using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class VoegRollenToe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Rollen",
                columns: new[] { "RolId", "Naam" },
                values: new object[,]
                {
                    { 6, "gebruiker" },
                    { 7, "Beheerder" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rollen",
                keyColumn: "RolId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Rollen",
                keyColumn: "RolId",
                keyValue: 7);
        }
    }
}
