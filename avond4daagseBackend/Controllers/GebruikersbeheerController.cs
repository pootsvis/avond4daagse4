
using Avond4DaagseBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Voorzitter")]
public class GebruikersbeheerController(
    ApplicationDbContext context
) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetGebruikers()
    {
        var gebruikers = await context.Gebruikers
            .AsNoTracking()
            .OrderBy(g => g.Naam)
            .Select(g => new
            {
                gebruikerId = g.GebruikerId,
                naam = g.Naam,
                email = g.Email,

                rollen = g.GebruikerRollen
                    .Select(gr => gr.Rol.Naam)
                    .ToList()
            })
            .ToListAsync();

        return Ok(gebruikers);
    }
}
