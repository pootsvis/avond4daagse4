
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolController(
    IRolService rolService
) : ControllerBase
{
    // Alleen de voorzitter mag alle rollen bekijken.
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(
        typeof(List<RolResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RolResponse>>> GetRollen()
    {
        List<Rol> rollen = await rolService.GetAllRollen();

        return Ok(
            rollen.Select(r => r.ToResponse()).ToList()
        );
    }

    // Alleen de voorzitter mag een specifieke rol bekijken.
    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(
        typeof(RolResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RolResponse>> GetRol(int id)
    {
        try
        {
            Rol rol = await rolService.GetRolById(id);

            return Ok(rol.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // Alleen de voorzitter mag rollen aan gebruikers toewijzen.
    // Voorheen stond hier AllowAnonymous. Dat was onveilig.
    [Authorize(Roles = "Voorzitter")]
    [HttpPost("{rolId}/gebruikers/{gebruikerId}")]
    [ProducesResponseType(
        typeof(RolResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RolResponse>> AssignRol(
        int rolId,
        int gebruikerId
    )
    {
        try
        {
            Rol rol = await rolService.AssignRol(
                rolId,
                gebruikerId
            );

            return Ok(rol.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
