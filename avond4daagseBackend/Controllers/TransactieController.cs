using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class TransactieController(
    ITransactieService transactieService
    ) : ControllerBase
{
    [Authorize(Roles = "Penningmeester")]
    [HttpGet]
    [ProducesResponseType(typeof(List<TransactieResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<TransactieResponse>>> GetTransacties()
    {
        List<Transactie> transacties = await transactieService.GetAllTransacties();
        return Ok(transacties.Select(t => t.ToResponse()).ToList());
    }

    [Authorize(Roles = "Penningmeester")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TransactieResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TransactieResponse>> GetTransactie(int id)
    {
        try
        {
            Transactie transactie = await transactieService.GetTransactieById(id);
            return Ok(transactie.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Penningmeester")]
    [HttpPost]
    [ProducesResponseType(typeof(TransactieResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TransactieResponse>> CreateTransactie(CreateTransactieDto dto)
    {
        try
        {
            Transactie aangemaakt = await transactieService.CreateTransactie(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Transactie transactie = await transactieService.GetTransactieById(aangemaakt.TransactieId);
            return CreatedAtAction(nameof(GetTransactie), new { id = transactie.TransactieId }, transactie.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }
    
    [Authorize(Roles = "Penningmeester")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TransactieResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TransactieResponse>> UpdateTransactie(int id, UpdateTransactieDto dto)
    {
        try
        {
            await transactieService.UpdateTransactie(id, dto);
            Transactie transactie = await transactieService.GetTransactieById(id);
            return Ok(transactie.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Penningmeester")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteTransactie(int id)
    {
        try
        {
            await transactieService.DeleteTransactie(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}