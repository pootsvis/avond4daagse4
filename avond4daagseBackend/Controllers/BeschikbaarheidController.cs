
using System.Security.Claims;
using System.Text.Json;
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BeschikbaarheidController(
    ApplicationDbContext context
) : ControllerBase
{
    private static readonly string[] GeldigeWaarden =
    [
        "",
        "beschikbaar",
        "misschien",
        "niet"
    ];

    public class BeschikbaarheidDto
    {
        public Dictionary<string, string> Avonden { get; set; }
            = new();

        public string Toelichting { get; set; }
            = string.Empty;
    }

    public class KoppelAccountDto
    {
        public int GebruikerId { get; set; }
    }

    private async Task<Vrijwilliger?> MijnVrijwilliger()
    {
        string? claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(claim, out int gebruikerId))
        {
            return null;
        }

        return await context.Vrijwilligers
            .FirstOrDefaultAsync(v =>
                v.GebruikerId == gebruikerId
            );
    }

    // ======================================
    // GET - EIGEN BESCHIKBAARHEID
    // ======================================

    [HttpGet("me")]
    public async Task<IActionResult> GetMijnBeschikbaarheid()
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Er is geen vrijwilliger gekoppeld aan dit account."
            );
        }

        var result = new BeschikbaarheidDto();

        if (!string.IsNullOrWhiteSpace(
            vrijwilliger.BeschikbaarheidJson))
        {
            try
            {
                result = JsonSerializer
                    .Deserialize<BeschikbaarheidDto>(
                        vrijwilliger.BeschikbaarheidJson
                    ) ?? new BeschikbaarheidDto();
            }
            catch (JsonException)
            {
                return Problem(
                    "De opgeslagen beschikbaarheid is ongeldig."
                );
            }
        }

        return Ok(result);
    }

    // ======================================
    // PUT - EIGEN BESCHIKBAARHEID
    // ======================================

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMijnBeschikbaarheid(
        BeschikbaarheidDto dto)
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Er is geen vrijwilliger gekoppeld aan dit account."
            );
        }

        if (dto.Avonden == null ||
            dto.Toelichting == null ||
            dto.Toelichting.Length > 600)
        {
            return BadRequest(
                "Ongeldige beschikbaarheidsgegevens."
            );
        }

        var avonden = new Dictionary<string, string>();

        foreach (var item in dto.Avonden)
        {
            if (!new[] { "1", "2", "3", "4" }
                .Contains(item.Key))
            {
                return BadRequest(
                    "Ongeldige wandelavond."
                );
            }

            if (!GeldigeWaarden.Contains(item.Value))
            {
                return BadRequest(
                    "Ongeldige beschikbaarheidsstatus."
                );
            }

            avonden[item.Key] = item.Value;
        }

        dto.Avonden = avonden;

        vrijwilliger.BeschikbaarheidJson =
            JsonSerializer.Serialize(dto);

        // Leesbare samenvatting voor vrijwilligersbeheer.
        vrijwilliger.Beschikbaarheid = string.Join(
            ", ",
            avonden
                .Where(a => !string.IsNullOrEmpty(a.Value))
                .OrderBy(a => a.Key)
                .Select(a =>
                    $"Avond {a.Key}: " +
                    (a.Value == "niet"
                        ? "niet beschikbaar"
                        : a.Value)
                )
        );

        await context.SaveChangesAsync();

        return Ok(dto);
    }

    // ======================================
    // VOORZITTER - ACCOUNT KOPPELEN
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("koppel/{vrijwilligerId:int}")]
    public async Task<IActionResult> KoppelAccount(
        int vrijwilligerId,
        KoppelAccountDto dto)
    {
        var vrijwilliger = await context.Vrijwilligers
            .FindAsync(vrijwilligerId);

        if (vrijwilliger == null)
        {
            return NotFound(
                "Vrijwilliger niet gevonden."
            );
        }

        var gebruiker = await context.Gebruikers
            .FindAsync(dto.GebruikerId);

        if (gebruiker == null)
        {
            return NotFound(
                "Gebruiker niet gevonden."
            );
        }

        bool juisteRol = await context.GebruikerRollen
            .AnyAsync(gr =>
                gr.GebruikerId == dto.GebruikerId &&
                (
                    gr.Rol.Naam == "Vrijwilliger" ||
                    gr.Rol.Naam == "Verkeersregelaars"
                )
            );

        if (!juisteRol)
        {
            return BadRequest(
                "Het account moet een vrijwilligersrol hebben."
            );
        }

        if (vrijwilliger.GebruikerId != null &&
            vrijwilliger.GebruikerId != dto.GebruikerId)
        {
            return Conflict(
                "Deze vrijwilliger heeft al een gekoppeld account."
            );
        }

        bool alGekoppeld = await context.Vrijwilligers
            .AnyAsync(v =>
                v.GebruikerId == dto.GebruikerId &&
                v.VrijwilligersId != vrijwilligerId
            );

        if (alGekoppeld)
        {
            return Conflict(
                "Dit account is al gekoppeld aan een vrijwilliger."
            );
        }

        vrijwilliger.GebruikerId = dto.GebruikerId;

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(
                "De accountkoppeling kon niet worden opgeslagen."
            );
        }

        return NoContent();
    }
}
