
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactVraagController(
    IContactvraagService contactvraagService
) : ControllerBase
{
    // Alleen de secretaris mag alle contactvragen bekijken.
    [Authorize(Roles = "Secretaris")]
    [HttpGet]
    [ProducesResponseType(
        typeof(List<ContactvraagResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ContactvraagResponse>>> GetContactvragen()
    {
        List<Contactvraag> contactvragen =
            await contactvraagService.GetAllContactvragen();

        return Ok(
            contactvragen.Select(c => c.ToResponse()).ToList()
        );
    }

    // Alleen de secretaris mag een specifieke contactvraag bekijken.
    [Authorize(Roles = "Secretaris")]
    [HttpGet("{id}")]
    [ProducesResponseType(
        typeof(ContactvraagResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactvraagResponse>> GetContactvraag(int id)
    {
        try
        {
            Contactvraag contactvraag =
                await contactvraagService.GetContactvraagById(id);

            return Ok(contactvraag.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // Bezoekers mogen via het contactformulier een vraag insturen.
    // Het bericht wordt slechts één keer opgeslagen.
    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(
        typeof(ContactvraagResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ContactvraagResponse>> CreateContactvraag(
        CreateContactvraagDto dto
    )
    {
        try
        {
            Contactvraag aangemaakt =
                await contactvraagService.CreateContactvraag(dto);

            return CreatedAtAction(
                nameof(GetContactvraag),
                new { id = aangemaakt.ContactvraagId },
                aangemaakt.ToResponse()
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Alleen de secretaris mag contactvragen aanpassen.
    [Authorize(Roles = "Secretaris")]
    [HttpPut("{id}")]
    [ProducesResponseType(
        typeof(ContactvraagResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactvraagResponse>> UpdateContactvraag(
        int id,
        UpdateContactvraagDto dto
    )
    {
        try
        {
            await contactvraagService.UpdateContactvraag(id, dto);

            Contactvraag contactvraag =
                await contactvraagService.GetContactvraagById(id);

            return Ok(contactvraag.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // Alleen de secretaris mag contactvragen verwijderen.
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
