
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Avond4DaagseBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class WachtwoordResetController(
    ApplicationDbContext context,
    IPasswordHasher<Gebruiker> passwordHasher,
    EmailService emailService,
    IConfiguration configuration,
    ILogger<WachtwoordResetController> logger
) : ControllerBase
{
    private record ResetToken(
        int GebruikerId,
        string TokenHash,
        string WachtwoordHash,
        DateTime VerlooptOp
    );

    private static readonly ConcurrentDictionary<int, ResetToken>
        Tokens = new();

    private static readonly ConcurrentDictionary<string, DateTime>
        Aanvragen = new();

    private static readonly SemaphoreSlim ResetLock = new(1, 1);

    public class AanvraagDto
    {
        public string Email { get; set; } = "";
    }

    public class ResetDto
    {
        public string Token { get; set; } = "";

        public string NieuwWachtwoord { get; set; } = "";

        public string BevestigWachtwoord { get; set; } = "";
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)
            )
        );
    }

    private static void VerwijderVerlopenTokens()
    {
        foreach (var item in Tokens)
        {
            if (item.Value.VerlooptOp <= DateTime.UtcNow)
            {
                Tokens.TryRemove(item.Key, out _);
            }
        }

        foreach (var item in Aanvragen)
        {
            if (item.Value <= DateTime.UtcNow.AddMinutes(-5))
            {
                Aanvragen.TryRemove(item.Key, out _);
            }
        }
    }

    // ======================================
    // POST - RESETLINK AANVRAGEN
    // ======================================

    [HttpPost("aanvragen")]
    public async Task<IActionResult> AanvragenReset(
        AanvraagDto dto
    )
    {
        string email = dto.Email.Trim().ToLowerInvariant();

        const string melding =
            "Als dit e-mailadres bij een account hoort, " +
            "ontvang je een wachtwoordresetlink.";

        if (email.Length == 0 || email.Length > 254)
        {
            return BadRequest(
                "Vul een geldig e-mailadres in."
            );
        }

        string ip =
            HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        string rateKey = ip + ":" + email;

        ResetToken? reset = null;
        string? token = null;

        await ResetLock.WaitAsync();

        try
        {
            VerwijderVerlopenTokens();

            if (
                Aanvragen.TryGetValue(rateKey, out var vorige) &&
                vorige > DateTime.UtcNow.AddMinutes(-1)
            )
            {
                return Ok(new { melding });
            }

            Aanvragen[rateKey] = DateTime.UtcNow;

            var gebruiker = await context.Gebruikers
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Email == email);

            if (gebruiker == null)
            {
                return Ok(new { melding });
            }

            token = Convert.ToHexString(
                RandomNumberGenerator.GetBytes(32)
            );

            reset = new ResetToken(
                gebruiker.GebruikerId,
                HashToken(token),
                gebruiker.Wachtwoord,
                DateTime.UtcNow.AddMinutes(30)
            );

            // Een nieuwe aanvraag vervangt de vorige link.
            Tokens[gebruiker.GebruikerId] = reset;
        }
        finally
        {
            ResetLock.Release();
        }

        string frontendUrl =
            configuration["Email:FrontendUrl"]
            ?? "http://localhost:5500";

        string resetLink =
            frontendUrl.TrimEnd('/') +
            "/Frontend/beheer/wachtwoord-reset.html#token=" +
            Uri.EscapeDataString(token!);

        string bericht = $"""
            Beste gebruiker,

            Er is een verzoek ontvangen om je wachtwoord
            voor de Avond4daagse te wijzigen.

            Gebruik onderstaande link:

            {resetLink}

            Deze link is 30 minuten geldig en kan
            slechts een keer worden gebruikt.

            Heb je dit niet aangevraagd?
            Dan kun je deze e-mail negeren.

            Met vriendelijke groet,

            Team Avond4daagse 2027
            """;

        try
        {
            await emailService.VerstuurAsync(
                email,
                "Avond4daagse 2027 - Wachtwoord herstellen",
                bericht
            );
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                "Verzenden van resetmail mislukt: {Type}",
                ex.GetType().Name
            );
        }

        return Ok(new { melding });
    }

    // ======================================
    // POST - NIEUW WACHTWOORD OPSLAAN
    // ======================================

    [HttpPost("bevestigen")]
    public async Task<IActionResult> BevestigenReset(
        ResetDto dto
    )
    {
        if (
            string.IsNullOrWhiteSpace(dto.Token) ||
            dto.Token.Length != 64
        )
        {
            return BadRequest(
                "De resetlink is ongeldig."
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
                "De wachtwoorden komen niet overeen."
            );
        }

        await ResetLock.WaitAsync();

        try
        {
            VerwijderVerlopenTokens();

            string tokenHash = HashToken(dto.Token);

            var reset = Tokens.Values.FirstOrDefault(t =>
                t.TokenHash == tokenHash
            );

            if (reset == null)
            {
                return BadRequest(
                    "Deze resetlink is ongeldig, " +
                    "verlopen of al gebruikt."
                );
            }

            var gebruiker = await context.Gebruikers
                .FindAsync(reset.GebruikerId);

            if (
                gebruiker == null ||
                gebruiker.Wachtwoord != reset.WachtwoordHash
            )
            {
                Tokens.TryRemove(reset.GebruikerId, out _);

                return BadRequest(
                    "Deze resetlink is niet meer geldig."
                );
            }

            string nieuwHash =
                passwordHasher.HashPassword(
                    gebruiker,
                    dto.NieuwWachtwoord
                );

            int gewijzigd = await context.Gebruikers
                .Where(g =>
                    g.GebruikerId == reset.GebruikerId &&
                    g.Wachtwoord == reset.WachtwoordHash
                )
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(
                        g => g.Wachtwoord,
                        nieuwHash
                    )
                );

            Tokens.TryRemove(reset.GebruikerId, out _);

            if (gewijzigd != 1)
            {
                return BadRequest(
                    "Deze resetlink is niet meer geldig."
                );
            }

            return Ok(new
            {
                melding =
                    "Je wachtwoord is succesvol gewijzigd."
            });
        }
        finally
        {
            ResetLock.Release();
        }
    }
}
