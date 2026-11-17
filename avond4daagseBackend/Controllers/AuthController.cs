using System.Security.Claims;
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IGebruikerService gebruikerService
) : ControllerBase
{
    /// <summary>
    /// Logt in met e-mail en wachtwoord. Bij succes krijgt de client een cookie.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GebruikerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GebruikerResponse>> Login(LoginDto loginDto)
    {
        try
        {
            Gebruiker gebruiker = await gebruikerService.ValidateLogin(loginDto.Email, loginDto.Wachtwoord);

            // De claims komen in de cookie te staan. [Authorize(Roles = "...")] leest de rol-claims.
            List<Claim> claims =
            [
                new Claim(ClaimTypes.NameIdentifier, gebruiker.GebruikerId.ToString()),
                new Claim(ClaimTypes.Name, gebruiker.Naam),
                new Claim(ClaimTypes.Email, gebruiker.Email)
            ];
            claims.AddRange(gebruiker.GebruikerRollen.Select(gr => new Claim(ClaimTypes.Role, gr.Rol.Naam)));

            ClaimsIdentity identity = new(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity));

            return Ok(new GebruikerResponse
            {
                GebruikerId = gebruiker.GebruikerId,
                Naam = gebruiker.Naam,
                Email = gebruiker.Email
            });
        }
        catch (InvalidOperationException)
        {
            // Bewust altijd dezelfde melding, ook als het e-mailadres niet bestaat
            return Unauthorized("Invalid email or password");
        }
    }

    /// <summary>
    /// Logt uit en verwijdert de cookie.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
    /// <summary>
    /// Geeft de ingelogde gebruiker en zijn rollen terug.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            Naam = User.Identity?.Name,
            Email = User.FindFirstValue(ClaimTypes.Email),
            Rollen = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
        });
    }
    
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(GebruikerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GebruikerResponse>> Register(RegisterDto registerDto)
    {
        try
        {
            Gebruiker gebruiker = await gebruikerService.Register(registerDto);
            return StatusCode(StatusCodes.Status201Created, new GebruikerResponse
            {
                GebruikerId = gebruiker.GebruikerId,
                Naam = gebruiker.Naam,
                Email = gebruiker.Email
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}