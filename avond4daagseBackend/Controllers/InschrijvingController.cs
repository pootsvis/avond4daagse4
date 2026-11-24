using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class InschrijvingController(
    IInschrijvingService inschrijvingService)
    : ControllerBase
{
    [Authorize(Roles = "voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<InschrijvingResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InschrijvingResponse>>> GetInschrijvingen()
    {
        List<Inschrijving> inschrijvingen = await inschrijvingService.GetAllInschrijvingen();
        return Ok(inschrijvingen.Select(i => i.ToResponse()).ToList());
    }

    [Authorize(Roles = "voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InschrijvingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InschrijvingResponse>> GetInschrijving(int id)
    {
        try
        {
            Inschrijving inschrijving = await inschrijvingService.GetInschrijvingById(id);
            return Ok(inschrijving.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(typeof(InschrijvingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InschrijvingResponse>> CreateInschrijving(CreateInschrijvingDto dto)
    {
        try
        {
            Inschrijving aangemaakt = await inschrijvingService.CreateInschrijving(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Inschrijving inschrijving = await inschrijvingService.GetInschrijvingById(aangemaakt.InschrijvingId);
            return CreatedAtAction(nameof(GetInschrijving), new { id = inschrijving.InschrijvingId }, inschrijving.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InschrijvingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InschrijvingResponse>> UpdateInschrijving(int id, UpdateInschrijvingDto dto)
    {
        try
        {
            await inschrijvingService.UpdateInschrijving(id, dto);
            Inschrijving inschrijving = await inschrijvingService.GetInschrijvingById(id);
            return Ok(inschrijving.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "voorzitter")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteInschrijving(int id)
    {
        try
        {
            await inschrijvingService.DeleteInschrijving(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}