using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class MakeTransactionRegistrationOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacties_Inschrijvingen_InschrijvingId",
                table: "Transacties");

            migrationBuilder.AlterColumn<int>(
                name: "InschrijvingId",
                table: "Transacties",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Transacties_Inschrijvingen_InschrijvingId",
                table: "Transacties",
                column: "InschrijvingId",
                principalTable: "Inschrijvingen",
                principalColumn: "InschrijvingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacties_Inschrijvingen_InschrijvingId",
                table: "Transacties");

            migrationBuilder.AlterColumn<int>(
                name: "InschrijvingId",
                table: "Transacties",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Transacties_Inschrijvingen_InschrijvingId",
                table: "Transacties",
                column: "InschrijvingId",
                principalTable: "Inschrijvingen",
                principalColumn: "InschrijvingId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
