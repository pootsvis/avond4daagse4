
using System.Security.Claims;
using Avond4DaagseBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Voorzitter,Secretaris,Penningmeester,Vrijwilliger,Verkeersregelaars")]
public class MijnTaakStatusController(
    ApplicationDbContext context
) : ControllerBase
{
    public class StatusDto
    {
        public string Status { get; set; } = "";
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> WijzigStatus(
        int id,
        StatusDto dto
    )
    {
        string? claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(claim, out int gebruikerId))
        {
            return Unauthorized();
        }

        string[] toegestaneStatussen =
        [
            "Open",
            "Bezig",
            "Gereed"
        ];

        if (!toegestaneStatussen.Contains(dto.Status))
        {
            return BadRequest(
                "Ongeldige taakstatus."
            );
        }

        var taak = await context.Draaiboektaken
            .Include(t => t.GebruikerDraaiboektaken)
            .Include(t => t.Taaktoewijzingen)
            .FirstOrDefaultAsync(t => t.TaakId == id);

        if (taak == null)
        {
            return NotFound("Taak niet gevonden.");
        }

        bool eigenTaak =
            taak.GebruikerDraaiboektaken.Any(g =>
                g.GebruikerId == gebruikerId
            );

        if (!eigenTaak)
        {
            return Forbid();
        }

        if (
            taak.GebruikerDraaiboektaken.Count != 1 ||
            taak.Taaktoewijzingen.Any()
        )
        {
            return Conflict(
                "Deze taak is onderdeel van een gezamenlijke " +
                "planning. Alleen de voorzitter kan deze " +
                "status aanpassen."
            );
        }

        taak.Status = dto.Status;

        await context.SaveChangesAsync();

        return Ok(new
        {
            taakId = taak.TaakId,
            status = taak.Status
        });
    }
}
