using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class VrijwilligerController(
    IVrijwilligerService vrijwilligerService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<VrijwilligerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<VrijwilligerResponse>>> GetVrijwilligers()
    {
        List<Vrijwilliger> vrijwilligers = await vrijwilligerService.GetAllVrijwilligers();
        return Ok(vrijwilligers.Select(v => v.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(VrijwilligerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VrijwilligerResponse>> GetVrijwilliger(int id)
    {
        try
        {
            Vrijwilliger vrijwilliger = await vrijwilligerService.GetVrijwilligerById(id);
            return Ok(vrijwilliger.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(VrijwilligerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VrijwilligerResponse>> CreateVrijwilliger(CreateVrijwilligerDto dto)
    {
        try
        {
            Vrijwilliger aangemaakt = await vrijwilligerService.CreateVrijwilliger(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Vrijwilliger vrijwilliger = await vrijwilligerService.GetVrijwilligerById(aangemaakt.VrijwilligersId);
            return CreatedAtAction(nameof(GetVrijwilliger), new { id = vrijwilliger.VrijwilligersId }, vrijwilliger.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(VrijwilligerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VrijwilligerResponse>> UpdateVrijwilliger(int id, UpdateVrijwilligerDto dto)
    {
        try
        {
            await vrijwilligerService.UpdateVrijwilliger(id, dto);
            Vrijwilliger vrijwilliger = await vrijwilligerService.GetVrijwilligerById(id);
            return Ok(vrijwilliger.ToResponse());
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
    public async Task<ActionResult> DeleteVrijwilliger(int id)
    {
        try
        {
            await vrijwilligerService.DeleteVrijwilliger(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}