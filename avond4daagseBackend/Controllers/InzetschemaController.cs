
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Voorzitter,Secretaris,Penningmeester,Vrijwilliger,Verkeersregelaars")]
public class InzetschemaController(
    ApplicationDbContext context
) : ControllerBase
{
    internal record Dienst(
        string Key,
        int Avond,
        string Tijd,
        string Naam,
        int Capaciteit
    );

    private static readonly string[] Tijden =
    [
        "17:00–18:00",
        "18:00–19:00",
        "18:15–20:30",
        "19:30–21:30",
        "21:00–22:00"
    ];

    private static readonly string[,] Namen =
    {
        {
            "Opbouw startterrein",
            "Opbouw startterrein",
            "Opbouw startterrein",
            "Finish opbouw"
        },
        {
            "Startbureau",
            "Startbureau",
            "Startbureau",
            "Startbureau"
        },
        {
            "Routeposten",
            "Routeposten",
            "Routeposten",
            "Routeposten"
        },
        {
            "Finishteam",
            "Finishteam",
            "Finishteam",
            "Medaille-uitgifte"
        },
        {
            "Afbouw",
            "Afbouw",
            "Afbouw",
            "Eindschoonmaak"
        }
    };

    private static readonly int[,] Capaciteiten =
    {
        { 6, 6, 6, 10 },
        { 5, 5, 5, 5 },
        { 14, 14, 14, 14 },
        { 6, 6, 6, 15 },
        { 4, 4, 4, 8 }
    };

    internal static List<Dienst> Diensten()
    {
        var result = new List<Dienst>();

        for (int rij = 0; rij < 5; rij++)
        {
            for (int dag = 0; dag < 4; dag++)
            {
                result.Add(new Dienst(
                    $"{rij}-{dag + 1}",
                    dag + 1,
                    Tijden[rij],
                    Namen[rij, dag],
                    Capaciteiten[rij, dag]
                ));
            }
        }

        return result;
    }

    private static string Categorie(Dienst dienst)
    {
        return "Inzet:" + dienst.Key;
    }

    public class ToewijzingDto
    {
        public int VrijwilligersId { get; set; }
    }

    // ======================================
    // GET - DIENSTEN EN BEZETTING
    // ALLE ORGANISATIEROLLEN
    // ======================================

    [HttpGet]
    public async Task<IActionResult> GetInzetschema()
    {
        bool kanBeheren = User.IsInRole("Voorzitter");

        var taken = await context.Draaiboektaken
            .AsNoTracking()
            .Where(t => t.Categorie.StartsWith("Inzet:"))
            .Include(t => t.Taaktoewijzingen)
                .ThenInclude(t => t.Vrijwilliger)
                    .ThenInclude(v => v.Persoon)
            .ToListAsync();

        var result = Diensten().Select(dienst =>
        {
            var taak = taken.FirstOrDefault(t =>
                t.Categorie == Categorie(dienst)
            );

            var vrijwilligers = taak?.Taaktoewijzingen
                .Select(t => new
                {
                    vrijwilligersId = t.VrijwilligersId,
                    naam =
                        t.Vrijwilliger.Persoon.Voornaam +
                        " " +
                        t.Vrijwilliger.Persoon.Achternaam
                })
                .ToList();

            int bezet = vrijwilligers?.Count ?? 0;

            return new
            {
                key = dienst.Key,
                avond = dienst.Avond,
                tijd = dienst.Tijd,
                naam = dienst.Naam,
                capaciteit = dienst.Capaciteit,
                bezet,

                open = Math.Max(
                    0,
                    dienst.Capaciteit - bezet
                ),

                vrijwilligers = kanBeheren
                    ? vrijwilligers
                    : null
            };
        });

        return Ok(result);
    }

    // ======================================
    // GET - VRIJWILLIGERS
    // ALLEEN VOORZITTER
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("vrijwilligers")]
    public async Task<IActionResult> GetVrijwilligers()
    {
        var vrijwilligers = await context.Vrijwilligers
            .Include(v => v.Persoon)
            .ToListAsync();

        return Ok(vrijwilligers.Select(v => new
        {
            vrijwilligersId = v.VrijwilligersId,

            naam =
                v.Persoon.Voornaam + " " +
                v.Persoon.Achternaam,

            rol = v.Voorkeursrol,

            gekoppeldAccount =
                v.GebruikerId.HasValue,

            beschikbaarheid =
                v.Beschikbaarheid
        }));
    }

    // ======================================
    // BESCHIKBAARHEID CONTROLEREN
    // ======================================

    private static bool IsNietBeschikbaar(
        Vrijwilliger vrijwilliger,
        int avond
    )
    {
        if (string.IsNullOrWhiteSpace(
            vrijwilliger.BeschikbaarheidJson))
        {
            return false;
        }

        using var document = JsonDocument.Parse(
            vrijwilliger.BeschikbaarheidJson
        );

        var root = document.RootElement;

        if (
            !root.TryGetProperty("Avonden", out var avonden) &&
            !root.TryGetProperty("avonden", out avonden)
        )
        {
            return false;
        }

        return avonden.TryGetProperty(
            avond.ToString(),
            out var waarde
        ) && waarde.GetString() == "niet";
    }

    private static bool Overlap(
        Dienst eerste,
        Dienst tweede
    )
    {
        if (eerste.Avond != tweede.Avond)
        {
            return false;
        }

        var a = eerste.Tijd.Split('–');
        var b = tweede.Tijd.Split('–');

        return TimeOnly.Parse(a[0]) < TimeOnly.Parse(b[1])
            && TimeOnly.Parse(b[0]) < TimeOnly.Parse(a[1]);
    }

    // ======================================
    // POST - VRIJWILLIGER TOEWIJZEN
    // ALLEEN VOORZITTER
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpPost("{key}")]
    public async Task<IActionResult> Toewijzen(
        string key,
        ToewijzingDto dto
    )
    {
        var dienst = Diensten()
            .FirstOrDefault(d => d.Key == key);

        if (dienst == null)
        {
            return NotFound("Dienst niet gevonden.");
        }

        await using var transaction =
            await context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable
            );

        try
        {
            var vrijwilliger = await context.Vrijwilligers
                .FindAsync(dto.VrijwilligersId);

            if (vrijwilliger == null)
            {
                return NotFound(
                    "Vrijwilliger niet gevonden."
                );
            }

            if (IsNietBeschikbaar(
                vrijwilliger,
                dienst.Avond))
            {
                return Conflict(
                    "Deze vrijwilliger is niet beschikbaar " +
                    "op deze wandelavond."
                );
            }

            var bestaandeTaken =
                await context.Draaiboektaken
                    .Where(t =>
                        t.Categorie.StartsWith("Inzet:")
                    )
                    .Include(t => t.Taaktoewijzingen)
                    .Include(t => t.GebruikerDraaiboektaken)
                    .ToListAsync();

            var taak = bestaandeTaken.FirstOrDefault(t =>
                t.Categorie == Categorie(dienst)
            );

            if (taak != null)
            {
                if (taak.Taaktoewijzingen.Any(t =>
                    t.VrijwilligersId == dto.VrijwilligersId))
                {
                    return Conflict(
                        "Vrijwilliger is al toegewezen."
                    );
                }

                if (taak.Taaktoewijzingen.Count >=
                    dienst.Capaciteit)
                {
                    return Conflict(
                        "Deze dienst is volledig bezet."
                    );
                }
            }

            foreach (var andere in Diensten())
            {
                if (!Overlap(dienst, andere))
                {
                    continue;
                }

                bool ingepland = bestaandeTaken.Any(t =>
                    t.Categorie == Categorie(andere) &&
                    t.Taaktoewijzingen.Any(a =>
                        a.VrijwilligersId ==
                        dto.VrijwilligersId
                    )
                );

                if (ingepland)
                {
                    return Conflict(
                        "Vrijwilliger heeft al een " +
                        "overlappende dienst."
                    );
                }
            }

            if (taak == null)
            {
                taak = new Draaiboektaak
                {
                    Titel = dienst.Naam,

                    Beschrijving =
                        $"Voorlopige dienst Avond " +
                        $"{dienst.Avond}, {dienst.Tijd}",

                    Datum = new DateOnly(
                        2027, 6, dienst.Avond
                    ),

                    Categorie = Categorie(dienst),

                    Status = "Open",

                    Verantwoordelijke = dienst.Naam
                };

                context.Draaiboektaken.Add(taak);
            }

            taak.Taaktoewijzingen.Add(
                new Taaktoewijzing
                {
                    VrijwilligersId =
                        vrijwilliger.VrijwilligersId
                }
            );

            if (vrijwilliger.GebruikerId.HasValue)
            {
                int gebruikerId =
                    vrijwilliger.GebruikerId.Value;

                if (!taak.GebruikerDraaiboektaken.Any(g =>
                    g.GebruikerId == gebruikerId))
                {
                    taak.GebruikerDraaiboektaken.Add(
                        new GebruikerDraaiboektaak
                        {
                            GebruikerId = gebruikerId
                        }
                    );
                }
            }

            await context.SaveChangesAsync();

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (JsonException)
        {
            return Conflict(
                "De beschikbaarheidsgegevens zijn ongeldig."
            );
        }
        catch (DbUpdateException)
        {
            return Conflict(
                "Toewijzing kon niet worden opgeslagen. " +
                "Vernieuw het overzicht."
            );
        }
    }

    // ======================================
    // DELETE - TOEWIJZING VERWIJDEREN
    // ALLEEN VOORZITTER
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{key}/{vrijwilligersId:int}")]
    public async Task<IActionResult> VerwijderToewijzing(
        string key,
        int vrijwilligersId
    )
    {
        var dienst = Diensten()
            .FirstOrDefault(d => d.Key == key);

        if (dienst == null)
        {
            return NotFound("Dienst niet gevonden.");
        }

        var taak = await context.Draaiboektaken
            .Include(t => t.Taaktoewijzingen)
                .ThenInclude(t => t.Vrijwilliger)
            .Include(t => t.GebruikerDraaiboektaken)
            .FirstOrDefaultAsync(t =>
                t.Categorie == Categorie(dienst)
            );

        if (taak == null)
        {
            return NotFound("Dienst niet gevonden.");
        }

        var toewijzing = taak.Taaktoewijzingen
            .FirstOrDefault(t =>
                t.VrijwilligersId == vrijwilligersId
            );

        if (toewijzing == null)
        {
            return NotFound("Toewijzing niet gevonden.");
        }

        var gebruikerId =
            toewijzing.Vrijwilliger.GebruikerId;

        if (gebruikerId.HasValue)
        {
            var gebruikerTaak =
                taak.GebruikerDraaiboektaken
                    .FirstOrDefault(g =>
                        g.GebruikerId == gebruikerId.Value
                    );

            if (gebruikerTaak != null)
            {
                context.GebruikerDraaiboektaken
                    .Remove(gebruikerTaak);
            }
        }

        context.Taaktoewijzingen.Remove(toewijzing);

        await context.SaveChangesAsync();

        return NoContent();
    }
}
