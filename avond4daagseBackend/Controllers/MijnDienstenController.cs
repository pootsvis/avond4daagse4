
using System.Security.Claims;
using Avond4DaagseBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Vrijwilliger,Verkeersregelaars")]
public class MijnDienstenController(
    ApplicationDbContext context
) : ControllerBase
{
    // ======================================
    // GET - PERSOONLIJKE DIENSTEN
    // ======================================

    [HttpGet("me")]
    public async Task<IActionResult> GetMijnDiensten()
    {
        string? claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(claim, out int gebruikerId))
        {
            return Unauthorized();
        }

        var vrijwilliger = await context.Vrijwilligers
            .Where(v => v.GebruikerId == gebruikerId)
            .Select(v => new
            {
                v.VrijwilligersId
            })
            .FirstOrDefaultAsync();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Geen vrijwilliger gekoppeld aan dit account."
            );
        }

        var taken = await context.Draaiboektaken
            .AsNoTracking()
            .Where(t =>
                t.Categorie.StartsWith("Inzet:") &&
                t.Taaktoewijzingen.Any(a =>
                    a.VrijwilligersId ==
                    vrijwilliger.VrijwilligersId
                )
            )
            .Select(t => new
            {
                t.Categorie
            })
            .ToListAsync();

        var categorieen = taken
            .Select(t => t.Categorie)
            .ToHashSet();

        var result = InzetschemaController.Diensten()
            .Where(d =>
                categorieen.Contains("Inzet:" + d.Key)
            )
            .OrderBy(d => d.Avond)
            .ThenBy(d => d.Tijd)
            .Select(d => new
            {
                key = d.Key,
                avond = d.Avond,
                naam = d.Naam,
                tijd = d.Tijd,
                locatie = "Nog niet bevestigd",
                status = "Ingepland"
            })
            .ToList();

        return Ok(result);
    }
}
