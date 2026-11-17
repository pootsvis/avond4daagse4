using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace avond4daagseBackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contactpersonen",
                columns: table => new
                {
                    ContactpersoonId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefoonnummer = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contactpersonen", x => x.ContactpersoonId);
                });

            migrationBuilder.CreateTable(
                name: "Deelnames",
                columns: table => new
                {
                    DeelnameId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    School = table.Column<string>(type: "text", nullable: false),
                    Groep = table.Column<string>(type: "text", nullable: false),
                    Geboortejaar = table.Column<int>(type: "integer", nullable: false),
                    HoeveelheidKeer = table.Column<int>(type: "integer", nullable: false),
                    NeemtBegeleiderMee = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deelnames", x => x.DeelnameId);
                });

            migrationBuilder.CreateTable(
                name: "Draaiboektaken",
                columns: table => new
                {
                    TaakId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titel = table.Column<string>(type: "text", nullable: false),
                    Beschrijving = table.Column<string>(type: "text", nullable: false),
                    Datum = table.Column<DateOnly>(type: "date", nullable: false),
                    Categorie = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Verantwoordelijke = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Draaiboektaken", x => x.TaakId);
                });

            migrationBuilder.CreateTable(
                name: "Gebruikers",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Wachtwoord = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gebruikers", x => x.GebruikerId);
                });

            migrationBuilder.CreateTable(
                name: "InzetSchemas",
                columns: table => new
                {
                    InzetSchemaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tijd = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Datum = table.Column<DateOnly>(type: "date", nullable: false),
                    Taak = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InzetSchemas", x => x.InzetSchemaId);
                });

            migrationBuilder.CreateTable(
                name: "Personen",
                columns: table => new
                {
                    PersoonId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Achternaam = table.Column<string>(type: "text", nullable: false),
                    Voornaam = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personen", x => x.PersoonId);
                });

            migrationBuilder.CreateTable(
                name: "PraktischeInformaties",
                columns: table => new
                {
                    PraktischeInformatieId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Bereikbaarheid = table.Column<string>(type: "text", nullable: false),
                    Deelnemersinformatie = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PraktischeInformaties", x => x.PraktischeInformatieId);
                });

            migrationBuilder.CreateTable(
                name: "Rechten",
                columns: table => new
                {
                    RechtId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rechten", x => x.RechtId);
                });

            migrationBuilder.CreateTable(
                name: "Rollen",
                columns: table => new
                {
                    RolId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rollen", x => x.RolId);
                });

            migrationBuilder.CreateTable(
                name: "Sponsors",
                columns: table => new
                {
                    SponsorId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sponsors", x => x.SponsorId);
                });

            migrationBuilder.CreateTable(
                name: "GebruikerDraaiboektaken",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false),
                    TaakId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GebruikerDraaiboektaken", x => new { x.GebruikerId, x.TaakId });
                    table.ForeignKey(
                        name: "FK_GebruikerDraaiboektaken_Draaiboektaken_TaakId",
                        column: x => x.TaakId,
                        principalTable: "Draaiboektaken",
                        principalColumn: "TaakId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GebruikerDraaiboektaken_Gebruikers_GebruikerId",
                        column: x => x.GebruikerId,
                        principalTable: "Gebruikers",
                        principalColumn: "GebruikerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contactvragen",
                columns: table => new
                {
                    ContactvraagId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Voornaam = table.Column<string>(type: "text", nullable: false),
                    Achternaam = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Onderwerp = table.Column<string>(type: "text", nullable: false),
                    Bericht = table.Column<string>(type: "text", nullable: false),
                    Datum = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Conceptreactie = table.Column<string>(type: "text", nullable: true),
                    PersoonId = table.Column<int>(type: "integer", nullable: false),
                    GebruikerId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contactvragen", x => x.ContactvraagId);
                    table.ForeignKey(
                        name: "FK_Contactvragen_Gebruikers_GebruikerId",
                        column: x => x.GebruikerId,
                        principalTable: "Gebruikers",
                        principalColumn: "GebruikerId");
                    table.ForeignKey(
                        name: "FK_Contactvragen_Personen_PersoonId",
                        column: x => x.PersoonId,
                        principalTable: "Personen",
                        principalColumn: "PersoonId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deelnemers",
                columns: table => new
                {
                    DeelnemerId = table.Column<int>(type: "integer", nullable: false),
                    DeelnameId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deelnemers", x => x.DeelnemerId);
                    table.ForeignKey(
                        name: "FK_Deelnemers_Deelnames_DeelnameId",
                        column: x => x.DeelnameId,
                        principalTable: "Deelnames",
                        principalColumn: "DeelnameId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Deelnemers_Personen_DeelnemerId",
                        column: x => x.DeelnemerId,
                        principalTable: "Personen",
                        principalColumn: "PersoonId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vrijwilligers",
                columns: table => new
                {
                    VrijwilligersId = table.Column<int>(type: "integer", nullable: false),
                    Beschikbaarheid = table.Column<string>(type: "text", nullable: false),
                    Telefoonnummer = table.Column<string>(type: "text", nullable: false),
                    Voorkeursrol = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Inzetting = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vrijwilligers", x => x.VrijwilligersId);
                    table.ForeignKey(
                        name: "FK_Vrijwilligers_Personen_VrijwilligersId",
                        column: x => x.VrijwilligersId,
                        principalTable: "Personen",
                        principalColumn: "PersoonId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evenementen",
                columns: table => new
                {
                    EvenementId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Beschrijving = table.Column<string>(type: "text", nullable: false),
                    Datum = table.Column<DateOnly>(type: "date", nullable: false),
                    Locatie = table.Column<string>(type: "text", nullable: false),
                    InschrijvingGeopend = table.Column<bool>(type: "boolean", nullable: false),
                    Publicatiestatus = table.Column<string>(type: "text", nullable: false),
                    InzetSchemaId = table.Column<int>(type: "integer", nullable: false),
                    PraktischeInformatieId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evenementen", x => x.EvenementId);
                    table.ForeignKey(
                        name: "FK_Evenementen_InzetSchemas_InzetSchemaId",
                        column: x => x.InzetSchemaId,
                        principalTable: "InzetSchemas",
                        principalColumn: "InzetSchemaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Evenementen_PraktischeInformaties_PraktischeInformatieId",
                        column: x => x.PraktischeInformatieId,
                        principalTable: "PraktischeInformaties",
                        principalColumn: "PraktischeInformatieId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GebruikerRollen",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false),
                    RolId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GebruikerRollen", x => new { x.GebruikerId, x.RolId });
                    table.ForeignKey(
                        name: "FK_GebruikerRollen_Gebruikers_GebruikerId",
                        column: x => x.GebruikerId,
                        principalTable: "Gebruikers",
                        principalColumn: "GebruikerId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GebruikerRollen_Rollen_RolId",
                        column: x => x.RolId,
                        principalTable: "Rollen",
                        principalColumn: "RolId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolRechten",
                columns: table => new
                {
                    RolId = table.Column<int>(type: "integer", nullable: false),
                    RechtId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolRechten", x => new { x.RolId, x.RechtId });
                    table.ForeignKey(
                        name: "FK_RolRechten_Rechten_RechtId",
                        column: x => x.RechtId,
                        principalTable: "Rechten",
                        principalColumn: "RechtId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolRechten_Rollen_RolId",
                        column: x => x.RolId,
                        principalTable: "Rollen",
                        principalColumn: "RolId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Taaktoewijzingen",
                columns: table => new
                {
                    ToewijzingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VrijwilligersId = table.Column<int>(type: "integer", nullable: false),
                    TaakId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Taaktoewijzingen", x => x.ToewijzingId);
                    table.ForeignKey(
                        name: "FK_Taaktoewijzingen_Draaiboektaken_TaakId",
                        column: x => x.TaakId,
                        principalTable: "Draaiboektaken",
                        principalColumn: "TaakId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Taaktoewijzingen_Vrijwilligers_VrijwilligersId",
                        column: x => x.VrijwilligersId,
                        principalTable: "Vrijwilligers",
                        principalColumn: "VrijwilligersId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvenementSponsors",
                columns: table => new
                {
                    EvenementId = table.Column<int>(type: "integer", nullable: false),
                    SponsorId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvenementSponsors", x => new { x.EvenementId, x.SponsorId });
                    table.ForeignKey(
                        name: "FK_EvenementSponsors_Evenementen_EvenementId",
                        column: x => x.EvenementId,
                        principalTable: "Evenementen",
                        principalColumn: "EvenementId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EvenementSponsors_Sponsors_SponsorId",
                        column: x => x.SponsorId,
                        principalTable: "Sponsors",
                        principalColumn: "SponsorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inschrijvingen",
                columns: table => new
                {
                    InschrijvingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Inschrijfdatum = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AantalDeelnemers = table.Column<int>(type: "integer", nullable: false),
                    EvenementId = table.Column<int>(type: "integer", nullable: false),
                    ContactpersoonId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inschrijvingen", x => x.InschrijvingId);
                    table.ForeignKey(
                        name: "FK_Inschrijvingen_Contactpersonen_ContactpersoonId",
                        column: x => x.ContactpersoonId,
                        principalTable: "Contactpersonen",
                        principalColumn: "ContactpersoonId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inschrijvingen_Evenementen_EvenementId",
                        column: x => x.EvenementId,
                        principalTable: "Evenementen",
                        principalColumn: "EvenementId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Routes",
                columns: table => new
                {
                    RouteId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Afstand = table.Column<double>(type: "double precision", nullable: false),
                    Starttijd = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Controlepost = table.Column<string>(type: "text", nullable: false),
                    EvenementId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routes", x => x.RouteId);
                    table.ForeignKey(
                        name: "FK_Routes_Evenementen_EvenementId",
                        column: x => x.EvenementId,
                        principalTable: "Evenementen",
                        principalColumn: "EvenementId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transacties",
                columns: table => new
                {
                    TransactieId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Datum = table.Column<DateOnly>(type: "date", nullable: false),
                    Bedrag = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Omschrijving = table.Column<string>(type: "text", nullable: false),
                    Categorie = table.Column<string>(type: "text", nullable: false),
                    Rekening = table.Column<string>(type: "text", nullable: false),
                    Betaalstatus = table.Column<string>(type: "text", nullable: false),
                    Factuur = table.Column<string>(type: "text", nullable: false),
                    InschrijvingId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transacties", x => x.TransactieId);
                    table.ForeignKey(
                        name: "FK_Transacties_Inschrijvingen_InschrijvingId",
                        column: x => x.InschrijvingId,
                        principalTable: "Inschrijvingen",
                        principalColumn: "InschrijvingId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Betalingen",
                columns: table => new
                {
                    BetalingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Bedrag = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Betaaldatum = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    TransactieId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Betalingen", x => x.BetalingId);
                    table.ForeignKey(
                        name: "FK_Betalingen_Transacties_TransactieId",
                        column: x => x.TransactieId,
                        principalTable: "Transacties",
                        principalColumn: "TransactieId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Rollen",
                columns: new[] { "RolId", "Naam" },
                values: new object[,]
                {
                    { 1, "Vrijwilliger" },
                    { 2, "Penningmeester" },
                    { 3, "Verkeersregelaars" },
                    { 4, "Secretaris" },
                    { 5, "Voorzitter" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Betalingen_TransactieId",
                table: "Betalingen",
                column: "TransactieId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contactvragen_GebruikerId",
                table: "Contactvragen",
                column: "GebruikerId");

            migrationBuilder.CreateIndex(
                name: "IX_Contactvragen_PersoonId",
                table: "Contactvragen",
                column: "PersoonId");

            migrationBuilder.CreateIndex(
                name: "IX_Deelnemers_DeelnameId",
                table: "Deelnemers",
                column: "DeelnameId");

            migrationBuilder.CreateIndex(
                name: "IX_Evenementen_InzetSchemaId",
                table: "Evenementen",
                column: "InzetSchemaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Evenementen_PraktischeInformatieId",
                table: "Evenementen",
                column: "PraktischeInformatieId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EvenementSponsors_SponsorId",
                table: "EvenementSponsors",
                column: "SponsorId");

            migrationBuilder.CreateIndex(
                name: "IX_GebruikerDraaiboektaken_TaakId",
                table: "GebruikerDraaiboektaken",
                column: "TaakId");

            migrationBuilder.CreateIndex(
                name: "IX_GebruikerRollen_RolId",
                table: "GebruikerRollen",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_Inschrijvingen_ContactpersoonId",
                table: "Inschrijvingen",
                column: "ContactpersoonId");

            migrationBuilder.CreateIndex(
                name: "IX_Inschrijvingen_EvenementId",
                table: "Inschrijvingen",
                column: "EvenementId");

            migrationBuilder.CreateIndex(
                name: "IX_RolRechten_RechtId",
                table: "RolRechten",
                column: "RechtId");

            migrationBuilder.CreateIndex(
                name: "IX_Routes_EvenementId",
                table: "Routes",
                column: "EvenementId");

            migrationBuilder.CreateIndex(
                name: "IX_Taaktoewijzingen_TaakId",
                table: "Taaktoewijzingen",
                column: "TaakId");

            migrationBuilder.CreateIndex(
                name: "IX_Taaktoewijzingen_VrijwilligersId",
                table: "Taaktoewijzingen",
                column: "VrijwilligersId");

            migrationBuilder.CreateIndex(
                name: "IX_Transacties_InschrijvingId",
                table: "Transacties",
                column: "InschrijvingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Betalingen");

            migrationBuilder.DropTable(
                name: "Contactvragen");

            migrationBuilder.DropTable(
                name: "Deelnemers");

            migrationBuilder.DropTable(
                name: "EvenementSponsors");

            migrationBuilder.DropTable(
                name: "GebruikerDraaiboektaken");

            migrationBuilder.DropTable(
                name: "GebruikerRollen");

            migrationBuilder.DropTable(
                name: "RolRechten");

            migrationBuilder.DropTable(
                name: "Routes");

            migrationBuilder.DropTable(
                name: "Taaktoewijzingen");

            migrationBuilder.DropTable(
                name: "Transacties");

            migrationBuilder.DropTable(
                name: "Deelnames");

            migrationBuilder.DropTable(
                name: "Sponsors");

            migrationBuilder.DropTable(
                name: "Gebruikers");

            migrationBuilder.DropTable(
                name: "Rechten");

            migrationBuilder.DropTable(
                name: "Rollen");

            migrationBuilder.DropTable(
                name: "Draaiboektaken");

            migrationBuilder.DropTable(
                name: "Vrijwilligers");

            migrationBuilder.DropTable(
                name: "Inschrijvingen");

            migrationBuilder.DropTable(
                name: "Personen");

            migrationBuilder.DropTable(
                name: "Contactpersonen");

            migrationBuilder.DropTable(
                name: "Evenementen");

            migrationBuilder.DropTable(
                name: "InzetSchemas");

            migrationBuilder.DropTable(
                name: "PraktischeInformaties");
        }
    }
}
