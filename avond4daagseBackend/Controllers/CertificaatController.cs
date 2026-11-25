
using System.Security.Claims;
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CertificaatController(
    ApplicationDbContext context
) : ControllerBase
{
    private const int MaxFileSize = 5 * 1024 * 1024;

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

    private static object Metadata(Vrijwilliger v)
    {
        return new
        {
            vrijwilligersId = v.VrijwilligersId,
            bestandsnaam = v.CertificaatNaam,
            uploadDatum = v.CertificaatUploadDatum,
            status = v.CertificaatBestand == null
                ? "Ontbreekt"
                : v.CertificaatStatus,
            aanwezig = v.CertificaatBestand != null
        };
    }

    public class BeoordelingDto
    {
        public string Status { get; set; } = string.Empty;
    }

    // ======================================
    // GET - EIGEN CERTIFICAAT
    // ======================================

    [Authorize(Roles = "Verkeersregelaars")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMijnCertificaat()
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Geen gekoppeld vrijwilligersaccount."
            );
        }

        return Ok(Metadata(vrijwilliger));
    }

    // ======================================
    // POST - PDF UPLOADEN
    // ======================================

    [Authorize(Roles = "Verkeersregelaars")]
    [HttpPost("me")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        IFormFile bestand
    )
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Geen gekoppeld vrijwilligersaccount."
            );
        }

        if (bestand == null ||
            bestand.Length < 5 ||
            bestand.Length > MaxFileSize)
        {
            return BadRequest(
                "Selecteer een PDF-bestand van maximaal 5 MB."
            );
        }

        if (!string.Equals(
            Path.GetExtension(bestand.FileName),
            ".pdf",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(
                "Alleen PDF-bestanden zijn toegestaan."
            );
        }

        using var stream = new MemoryStream();

        await bestand.CopyToAsync(stream);

        byte[] bytes = stream.ToArray();

        // Controleer de PDF-bestandssignatuur.
        if (bytes[0] != 0x25 ||
            bytes[1] != 0x50 ||
            bytes[2] != 0x44 ||
            bytes[3] != 0x46 ||
            bytes[4] != 0x2D)
        {
            return BadRequest(
                "Het bestand heeft geen geldige PDF-signatuur."
            );
        }

        vrijwilliger.CertificaatBestand = bytes;

        vrijwilliger.CertificaatNaam =
            Path.GetFileName(bestand.FileName);

        vrijwilliger.CertificaatUploadDatum =
            DateTime.UtcNow;

        vrijwilliger.CertificaatStatus =
            "In beoordeling";

        await context.SaveChangesAsync();

        return Ok(Metadata(vrijwilliger));
    }

    // ======================================
    // GET - EIGEN CERTIFICAAT DOWNLOADEN
    // ======================================

    [Authorize(Roles = "Verkeersregelaars")]
    [HttpGet("me/download")]
    public async Task<IActionResult> DownloadMijnCertificaat()
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger?.CertificaatBestand == null)
        {
            return NotFound(
                "Geen certificaat aanwezig."
            );
        }

        Response.Headers["Cache-Control"] = "no-store";

        return File(
            vrijwilliger.CertificaatBestand,
            "application/octet-stream",
            vrijwilliger.CertificaatNaam ?? "certificaat.pdf"
        );
    }

    // ======================================
    // GET - OVERZICHT VOOR VOORZITTER
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    public async Task<IActionResult> GetCertificaten()
    {
        var result = await context.Vrijwilligers
            .Where(v =>
                v.CertificaatBestand != null ||
                (
                    v.GebruikerId.HasValue &&
                    context.GebruikerRollen.Any(gr =>
                        gr.GebruikerId == v.GebruikerId &&
                        gr.Rol.Naam == "Verkeersregelaars"
                    )
                )
            )
            .Select(v => new
            {
                vrijwilligersId = v.VrijwilligersId,

                naam = v.Persoon.Voornaam + " " +
                    v.Persoon.Achternaam,

                bestandsnaam = v.CertificaatNaam,

                uploadDatum = v.CertificaatUploadDatum,

                status = v.CertificaatBestand == null
                    ? "Ontbreekt"
                    : v.CertificaatStatus,

                aanwezig = v.CertificaatBestand != null
            })
            .ToListAsync();

        return Ok(result);
    }

    // ======================================
    // GET - VOORZITTER DOWNLOADT CERTIFICAAT
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{vrijwilligerId:int}/download")]
    public async Task<IActionResult> Download(
        int vrijwilligerId
    )
    {
        var vrijwilliger = await context.Vrijwilligers
            .FindAsync(vrijwilligerId);

        if (vrijwilliger?.CertificaatBestand == null)
        {
            return NotFound(
                "Geen certificaat aanwezig."
            );
        }

        Response.Headers["Cache-Control"] = "no-store";

        return File(
            vrijwilliger.CertificaatBestand,
            "application/octet-stream",
            vrijwilliger.CertificaatNaam ?? "certificaat.pdf"
        );
    }

    // ======================================
    // PUT - CERTIFICAAT BEOORDELEN
    // ======================================

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{vrijwilligerId:int}/status")]
    public async Task<IActionResult> Beoordelen(
        int vrijwilligerId,
        BeoordelingDto dto
    )
    {
        if (dto.Status != "Goedgekeurd" &&
            dto.Status != "Afgekeurd")
        {
            return BadRequest(
                "Kies Goedgekeurd of Afgekeurd."
            );
        }

        var vrijwilliger = await context.Vrijwilligers
            .FindAsync(vrijwilligerId);

        if (vrijwilliger?.CertificaatBestand == null)
        {
            return NotFound(
                "Geen certificaat aanwezig."
            );
        }

        vrijwilliger.CertificaatStatus = dto.Status;

        await context.SaveChangesAsync();

        return Ok(Metadata(vrijwilliger));
    }

    // ======================================
    // DELETE - EIGEN CERTIFICAAT VERWIJDEREN
    // ======================================

    [Authorize(Roles = "Verkeersregelaars")]
    [HttpDelete("me")]
    public async Task<IActionResult> VerwijderMijnCertificaat()
    {
        var vrijwilliger = await MijnVrijwilliger();

        if (vrijwilliger == null)
        {
            return NotFound(
                "Geen gekoppeld vrijwilligersaccount."
            );
        }

        vrijwilliger.CertificaatBestand = null;
        vrijwilliger.CertificaatNaam = null;
        vrijwilliger.CertificaatUploadDatum = null;
        vrijwilliger.CertificaatStatus = "Ontbreekt";

        await context.SaveChangesAsync();

        return NoContent();
    }
}
