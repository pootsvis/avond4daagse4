using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EvenementController(
    IEvenementService evenementService
    ) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(List<EvenementResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EvenementResponse>>> GetEvenementen()
    {
        List<Evenement> evenementen = await evenementService.GetAllEvenementen();
        return Ok(evenementen.Select(t => t.ToResponse()).ToList());
    }
    
    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EvenementResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EvenementResponse>> GetEvenement(int id)
    {
        try
        {
            Evenement evenement = await evenementService.GetEvenementById(id);
            return Ok(evenement.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(EvenementResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<EvenementResponse>> CreateEvenement(CreateEvenementDto evenementDto)
    {
        Evenement aangemaakt = await evenementService.CreateEvenement(evenementDto);

        // Opnieuw ophalen zodat Persoon en Deelname zeker geladen zijn voor de response
        Evenement evenement = await evenementService.GetEvenementById(aangemaakt.EvenementId);
        return CreatedAtAction(nameof(GetEvenement), new { id = evenement.EvenementId }, evenement.ToResponse());
    }
    
    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(EvenementResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EvenementResponse>> UpdateEvenement(int id, UpdateEvenementDto evenementDto)
    {
        try
        {
            await evenementService.UpdateEvenement(id, evenementDto);
            Evenement evenement = await evenementService.GetEvenementById(id);
            return Ok(evenement.ToResponse());
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
    public async Task<ActionResult> DeleteEvenement(int id)
    {
        try
        {
            await evenementService.DeleteEvenement(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
