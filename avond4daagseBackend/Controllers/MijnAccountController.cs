
using System.Security.Claims;
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MijnAccountController(
    ApplicationDbContext context,
    IPasswordHasher<Gebruiker> passwordHasher
) : ControllerBase
{
    public class WachtwoordDto
    {
        public string HuidigWachtwoord { get; set; } = "";

        public string NieuwWachtwoord { get; set; } = "";

        public string BevestigWachtwoord { get; set; } = "";
    }

    [HttpPut("wachtwoord")]
    public async Task<IActionResult> WijzigWachtwoord(
        WachtwoordDto dto
    )
    {
        string? claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(claim, out int gebruikerId))
        {
            return Unauthorized();
        }

        var gebruiker = await context.Gebruikers
            .FindAsync(gebruikerId);

        if (gebruiker == null)
        {
            return Unauthorized();
        }

        if (string.IsNullOrEmpty(dto.HuidigWachtwoord))
        {
            return BadRequest(
                "Vul je huidige wachtwoord in."
            );
        }

        var resultaat = passwordHasher.VerifyHashedPassword(
            gebruiker,
            gebruiker.Wachtwoord,
            dto.HuidigWachtwoord
        );

        if (resultaat == PasswordVerificationResult.Failed)
        {
            return BadRequest(
                "Het huidige wachtwoord is onjuist."
            );
        }

        if (
            string.IsNullOrWhiteSpace(dto.NieuwWachtwoord) ||
            dto.NieuwWachtwoord.Length < 12 ||
            dto.NieuwWachtwoord.Length > 128
        )
        {
            return BadRequest(
                "Gebruik een wachtwoord van 12 tot 128 tekens."
            );
        }

        if (
            dto.NieuwWachtwoord !=
            dto.BevestigWachtwoord
        )
        {
            return BadRequest(
                "De nieuwe wachtwoorden komen niet overeen."
            );
        }

        if (
            dto.HuidigWachtwoord ==
            dto.NieuwWachtwoord
        )
        {
            return BadRequest(
                "Kies een ander wachtwoord."
            );
        }

        gebruiker.Wachtwoord =
            passwordHasher.HashPassword(
                gebruiker,
                dto.NieuwWachtwoord
            );

        await context.SaveChangesAsync();

        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        return NoContent();
    }
}
