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
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<RolResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RolResponse>>> GetRollen()
    {
        List<Rol> rollen = await rolService.GetAllRollen();
        return Ok(rollen.Select(r => r.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RolResponse), StatusCodes.Status200OK)]
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
    
    [AllowAnonymous]   // TIJDELIJK, alleen om te testen
    [HttpPost("{rolId}/gebruikers/{gebruikerId}")]
    public async Task<ActionResult<RolResponse>> AssignRol(int rolId, int gebruikerId)
    {
        try
        {
            Rol rol = await rolService.AssignRol(rolId, gebruikerId);
            return Ok(rol.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);   // "Rol not found" of "Gebruiker not found"
        }
    }
}