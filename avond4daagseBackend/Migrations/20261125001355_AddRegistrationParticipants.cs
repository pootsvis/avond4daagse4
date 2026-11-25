using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationParticipants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AfstandKm",
                table: "Inschrijvingen",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "InschrijvingId",
                table: "Deelnemers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "Geboortedatum",
                table: "Deelnames",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Deelnemers_InschrijvingId",
                table: "Deelnemers",
                column: "InschrijvingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Deelnemers_Inschrijvingen_InschrijvingId",
                table: "Deelnemers",
                column: "InschrijvingId",
                principalTable: "Inschrijvingen",
                principalColumn: "InschrijvingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Deelnemers_Inschrijvingen_InschrijvingId",
                table: "Deelnemers");

            migrationBuilder.DropIndex(
                name: "IX_Deelnemers_InschrijvingId",
                table: "Deelnemers");

            migrationBuilder.DropColumn(
                name: "AfstandKm",
                table: "Inschrijvingen");

            migrationBuilder.DropColumn(
                name: "InschrijvingId",
                table: "Deelnemers");

            migrationBuilder.DropColumn(
                name: "Geboortedatum",
                table: "Deelnames");
        }
    }
}
