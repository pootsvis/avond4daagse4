using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class GebruikerController(
    IGebruikerService gebruikerService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<GebruikerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GebruikerResponse>>> GetGebruikers()
    {
        List<Gebruiker> gebruikers = await gebruikerService.GetAllGebruikers();
        return Ok(gebruikers.Select(g => g.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GebruikerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GebruikerResponse>> GetGebruiker(int id)
    {
        try
        {
            Gebruiker gebruiker = await gebruikerService.GetGebruikerById(id);
            return Ok(gebruiker.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(GebruikerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GebruikerResponse>> CreateGebruiker(CreateGebruikerDto dto)
    {
        try
        {
            Gebruiker aangemaakt = await gebruikerService.CreateGebruiker(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Gebruiker gebruiker = await gebruikerService.GetGebruikerById(aangemaakt.GebruikerId);
            return CreatedAtAction(nameof(GetGebruiker), new { id = gebruiker.GebruikerId }, gebruiker.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(GebruikerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GebruikerResponse>> UpdateGebruiker(int id, UpdateGebruikerDto dto)
    {
        try
        {
            await gebruikerService.UpdateGebruiker(id, dto);
            Gebruiker gebruiker = await gebruikerService.GetGebruikerById(id);
            return Ok(gebruiker.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteGebruiker(int id)
    {
        try
        {
            await gebruikerService.DeleteGebruiker(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}