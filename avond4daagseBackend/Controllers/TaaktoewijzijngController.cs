using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaaktoewijzingController(
    ITaakToewijzingService taakToewijzingService
) : ControllerBase
{
    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet]
    [ProducesResponseType(typeof(List<TaaktoewijzingResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TaaktoewijzingResponse>>> GetTaaktoewijzingen()
    {
        List<Taaktoewijzing> taaktoewijzingen = await taakToewijzingService.GetAllTaaktoewijzingen();
        return Ok(taaktoewijzingen.Select(t => t.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaaktoewijzingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaaktoewijzingResponse>> GetTaaktoewijzing(int id)
    {
        try
        {
            Taaktoewijzing taaktoewijzing = await taakToewijzingService.GetTaaktoewijzingById(id);
            return Ok(taaktoewijzing.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter,Secretaris")]
    [HttpPost]
    [ProducesResponseType(typeof(TaaktoewijzingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaaktoewijzingResponse>> CreateTaaktoewijzing(CreateTaaktoewijzingDto taaktoewijzingDto)
    {
        try
        {
            Taaktoewijzing aangemaakt = await taakToewijzingService.CreateTaaktoewijzing(taaktoewijzingDto);
            return CreatedAtAction(
                nameof(GetTaaktoewijzing),
                new { id = aangemaakt.ToewijzingId },
                aangemaakt.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // "Vrijwilliger not found" of "Draaiboektaak not found"
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter,Secretaris")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteTaaktoewijzing(int id)
    {
        try
        {
            await taakToewijzingService.DeleteTaaktoewijzing(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}