using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class RechtController(
    IRechtService rechtService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(typeof(List<RechtResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RechtResponse>>> GetRechten()
    {
        List<Recht> rechten = await rechtService.GetAllRechten();
        return Ok(rechten.Select(r => r.ToResponse()).ToList());
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RechtResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RechtResponse>> GetRecht(int id)
    {
        try
        {
            Recht recht = await rechtService.GetRechtById(id);
            return Ok(recht.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(RechtResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RechtResponse>> CreateRecht(CreateRechtDto dto)
    {
        try
        {
            Recht recht = await rechtService.CreateRecht(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Recht createdRecht = await rechtService.GetRechtById(recht.RechtId);
            return CreatedAtAction(nameof(GetRecht), new { id = createdRecht.RechtId }, createdRecht.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(RechtResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RechtResponse>> UpdateRecht(int id, UpdateRechtDto dto)
    {
        try
        {
            await rechtService.UpdateRecht(id, dto);
            Recht recht = await rechtService.GetRechtById(id);
            return Ok(recht.ToResponse());
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
    public async Task<ActionResult> DeleteRecht(int id)
    {
        try
        {
            await rechtService.DeleteRecht(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}