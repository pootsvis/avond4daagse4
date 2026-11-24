using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class SponsorController(
    ISponsorService sponsorService
    ) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(List<SponsorResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SponsorResponse>>> GetSponsors()
    {
        List<Sponsor> sponsors = await sponsorService.GetAllSponsors();
        return Ok(sponsors.Select(s => s.ToResponse()).ToList());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SponsorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SponsorResponse>> GetSponsor(int id)
    {
        try
        {
            Sponsor sponsor = await sponsorService.GetSponsorById(id);
            return Ok(sponsor.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Penningmeester, Secretaris")]
    [HttpPost]
    [ProducesResponseType(typeof(SponsorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SponsorResponse>> CreateSponsor(CreateSponsorDto dto)
    {
        try
        {
            Sponsor aangemaakt = await sponsorService.CreateSponsor(dto);
            
            Sponsor sponsor = await sponsorService.GetSponsorById(aangemaakt.SponsorId);
            return CreatedAtAction(nameof(GetSponsor), new { id = sponsor.SponsorId }, sponsor.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [Authorize(Roles = "Penningmeester, Secretaris")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SponsorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SponsorResponse>> UpdateSponsor(int id, UpdateSponsorDto dto)
    {
        try
        {
            await sponsorService.UpdateSponsor(id, dto);
            Sponsor sponsor = await sponsorService.GetSponsorById(id);
            return Ok(sponsor.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Penningmeester, Secretaris")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteSponsor(int id)
    {
        try
        {
            await sponsorService.DeleteSponsor(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}