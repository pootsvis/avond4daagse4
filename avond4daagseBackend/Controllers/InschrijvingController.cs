
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Avond4DaagseBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;

namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InschrijvingController(
    IInschrijvingService inschrijvingService,
    EmailService emailService,
    ILogger<InschrijvingController> logger
) : ControllerBase
{
    // GET - ALLE INSCHRIJVINGEN

    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    [ProducesResponseType(
        typeof(List<InschrijvingResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InschrijvingResponse>>>
        GetInschrijvingen()
    {
        List<Inschrijving> inschrijvingen =
            await inschrijvingService.GetAllInschrijvingen();

        return Ok(
            inschrijvingen.Select(i =>
                i.ToResponse()
            ).ToList()
        );
    }

    // GET - SPECIFIEKE INSCHRIJVING

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    [ProducesResponseType(
        typeof(InschrijvingResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InschrijvingResponse>>
        GetInschrijving(int id)
    {
        try
        {
            Inschrijving inschrijving =
                await inschrijvingService.GetInschrijvingById(id);

            return Ok(inschrijving.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // POST - PUBLIEKE INSCHRIJVING

    [AllowAnonymous]
    [HttpPost]
    [ProducesResponseType(
        typeof(InschrijvingResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InschrijvingResponse>>
        CreateInschrijving(CreateInschrijvingDto dto)
    {
        string email =
            dto.Contactpersoon?.Email?.Trim() ?? "";

        if (
            !MailAddress.TryCreate(email, out var adres) ||
            adres.Address != email
        )
        {
            return BadRequest(
                "Vul een geldig e-mailadres in."
            );
        }

        try
        {
            Inschrijving aangemaakt =
                await inschrijvingService.CreateInschrijving(dto);

            Inschrijving inschrijving =
                await inschrijvingService.GetInschrijvingById(
                    aangemaakt.InschrijvingId
                );

            // De inschrijving is al opgeslagen.
            // Een mailfout mag de inschrijving niet annuleren.

            try
            {
                string bericht = $"""
                    Beste deelnemer,

                    Bedankt voor je inschrijving voor de
                    Avond4daagse 2027!

                    We hebben je inschrijving ontvangen.

                    INSCHRIJFGEGEVENS

                    Inschrijfnummer: {inschrijving.InschrijvingId}
                    Aantal deelnemers: {inschrijving.AantalDeelnemers}
                    Afstand: {inschrijving.AfstandKm} km
                    Status: {inschrijving.Status}

                    Dit bericht bevestigt de ontvangst
                    van je inschrijving.

                    Het is geen betalingsbevestiging.

                    Meer praktische informatie volgt
                    vanuit de organisatie.

                    Met vriendelijke groet,

                    Team Avond4daagse 2027
                    """;

                await emailService.VerstuurAsync(
                    email,
                    $"Avond4daagse 2027 - Inschrijving #{inschrijving.InschrijvingId}",
                    bericht
                );

                logger.LogInformation(
                    "Bevestigingsmail verzonden voor inschrijving {Id}",
                    inschrijving.InschrijvingId
                );
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    "Bevestigingsmail voor inschrijving {Id} mislukt: {Type}",
                    inschrijving.InschrijvingId,
                    ex.GetType().Name
                );
            }

            return CreatedAtAction(
                nameof(GetInschrijving),

                new
                {
                    id = inschrijving.InschrijvingId
                },

                inschrijving.ToResponse()
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT - INSCHRIJVING AANPASSEN

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(
        typeof(InschrijvingResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InschrijvingResponse>>
        UpdateInschrijving(
            int id,
            UpdateInschrijvingDto dto
        )
    {
        try
        {
            await inschrijvingService.UpdateInschrijving(
                id,
                dto
            );

            Inschrijving inschrijving =
                await inschrijvingService.GetInschrijvingById(id);

            return Ok(inschrijving.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // DELETE - INSCHRIJVING VERWIJDEREN

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult>
        DeleteInschrijving(int id)
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
