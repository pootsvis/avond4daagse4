using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerCertificates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "CertificaatBestand",
                table: "Vrijwilligers",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificaatNaam",
                table: "Vrijwilligers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificaatStatus",
                table: "Vrijwilligers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CertificaatUploadDatum",
                table: "Vrijwilligers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CertificaatBestand",
                table: "Vrijwilligers");

            migrationBuilder.DropColumn(
                name: "CertificaatNaam",
                table: "Vrijwilligers");

            migrationBuilder.DropColumn(
                name: "CertificaatStatus",
                table: "Vrijwilligers");

            migrationBuilder.DropColumn(
                name: "CertificaatUploadDatum",
                table: "Vrijwilligers");
        }
    }
}
