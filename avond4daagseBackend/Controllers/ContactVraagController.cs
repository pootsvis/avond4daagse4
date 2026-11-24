using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactVraagController(IContactvraagService contactvraagService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(List<ContactvraagResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ContactvraagResponse>>> GetContactvragen()
    {
        List<Contactvraag> contactvragen = await contactvraagService.GetAllContactvragen();
        return Ok(contactvragen.Select(c => c.ToResponse()).ToList());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContactvraagResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactvraagResponse>> GetContactvraag(int id)
    {
        try
        {
            Contactvraag contactvraag = await contactvraagService.GetContactvraagById(id);
            return Ok(contactvraag.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(typeof(ContactvraagResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ContactvraagResponse>> CreateContactvraag(CreateContactvraagDto dto)
    {
        try
        {
            Contactvraag contactvraag = await contactvraagService.CreateContactvraag(dto);

            // Opnieuw ophalen zodat de gekoppelde gebruikers zeker geladen zijn voor de response
            Contactvraag aangemaakt = await contactvraagService.CreateContactvraag(dto);
            return CreatedAtAction(nameof(GetContactvraag), new { id = aangemaakt.ContactvraagId }, aangemaakt.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            // bijvoorbeeld: een opgegeven GebruikerId bestaat niet
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Secretaris")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ContactvraagResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactvraagResponse>> UpdateContactvraag(int id, UpdateContactvraagDto dto)
    {
        try
        {
            await contactvraagService.UpdateContactvraag(id, dto);
            Contactvraag taak = await contactvraagService.GetContactvraagById(id);
            return Ok(taak.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Secretaris")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteContactvraag(int id)
    {
        try
        {
            await contactvraagService.DeleteContactvraag(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
