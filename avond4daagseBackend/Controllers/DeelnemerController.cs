using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeelnemerController(
    IDeelnemerService deelnemerService
) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<DeelnemerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DeelnemerResponse>>> GetDeelnemers()
    {
        List<Deelnemer> deelnemers = await deelnemerService.GetAllDeelnemers();
        return Ok(deelnemers.Select(d => d.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DeelnemerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeelnemerResponse>> GetDeelnemer(int id)
    {
        try
        {
            Deelnemer deelnemer = await deelnemerService.GetDeelnemerById(id);
            return Ok(deelnemer.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(typeof(DeelnemerResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<DeelnemerResponse>> CreateDeelnemer(CreateDeelnemerDto deelnemerDto)
    {
        Deelnemer aangemaakt = await deelnemerService.CreateDeelnemer(deelnemerDto);

        // Opnieuw ophalen zodat Persoon en Deelname zeker geladen zijn voor de response
        Deelnemer deelnemer = await deelnemerService.GetDeelnemerById(aangemaakt.DeelnemerId);
        return CreatedAtAction(nameof(GetDeelnemer), new { id = deelnemer.DeelnemerId }, deelnemer.ToResponse());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DeelnemerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeelnemerResponse>> UpdateDeelnemer(int id, UpdateDeelnemerDto deelnemerDto)
    {
        try
        {
            await deelnemerService.UpdateDeelnemer(id, deelnemerDto);
            Deelnemer deelnemer = await deelnemerService.GetDeelnemerById(id);
            return Ok(deelnemer.ToResponse());
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
    public async Task<ActionResult> DeleteDeelnemer(int id)
    {
        try
        {
            await deelnemerService.DeleteDeelnemer(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}