using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteGpxAndLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GpxPuntenJson",
                table: "Routes",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Startlocatie",
                table: "Routes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Wandelavond",
                table: "Routes",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GpxPuntenJson",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "Startlocatie",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "Wandelavond",
                table: "Routes");
        }
    }
}
