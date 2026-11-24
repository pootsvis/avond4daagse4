using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DraaiboekController(IDraaiboektaakService draaiboektaakService) : ControllerBase
{
    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet]
    [ProducesResponseType(typeof(List<DraaiboektaakResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DraaiboektaakResponse>>> GetDraaiboektaken()
    {
        List<Draaiboektaak> taken = await draaiboektaakService.GetAllDraaiboektaken();
        return Ok(taken.Select(t => t.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DraaiboektaakResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DraaiboektaakResponse>> GetDraaiboektaak(int id)
    {
        try
        {
            Draaiboektaak taak = await draaiboektaakService.GetDraaiboektaakById(id);
            return Ok(taak.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(DraaiboektaakResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DraaiboektaakResponse>> CreateDraaiboektaak(CreateDraaiboektaakDto dto)
    {
        try
        {
            Draaiboektaak aangemaakt = await draaiboektaakService.CreateDraaiboektaak(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Draaiboektaak taak = await draaiboektaakService.GetDraaiboektaakById(aangemaakt.TaakId);
            return CreatedAtAction(nameof(GetDraaiboektaak), new { id = taak.TaakId }, taak.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DraaiboektaakResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DraaiboektaakResponse>> UpdateDraaiboektaak(int id, UpdateDraaiboektaakDto dto)
    {
        try
        {
            await draaiboektaakService.UpdateDraaiboektaak(id, dto);
            Draaiboektaak taak = await draaiboektaakService.GetDraaiboektaakById(id);
            return Ok(taak.ToResponse());
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
    public async Task<ActionResult> DeleteDraaiboektaak(int id)
    {
        try
        {
            await draaiboektaakService.DeleteDraaiboektaak(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}