namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class SponsorController(
    ISponsorService sponsorService
    ) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sponsor>>> GetSponsors()
    {
        var sponsors = await sponsorService.GetAllSponsors();
        return Ok(sponsors);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<Sponsor>> GetSponsor(int id)
    {
        var sponsor = await sponsorService.GetSponsorById(id);
        if (sponsor == null)
        {
            return NotFound();
        }
        return Ok(sponsor);
    }
    
    [Authorize(Roles = "Penningmeester,Secretaris")]
    [HttpPost]
    public async Task<ActionResult<Sponsor>> CreateSponsor(CreateSponsorDto sponsor)
    {
        var createdSponsor = await sponsorService.CreateSponsor(sponsor);
        return CreatedAtAction(nameof(GetSponsor), new { id = createdSponsor.SponsorId }, createdSponsor);
    }
    
    [Authorize(Roles = "Penningmeester,Secretaris")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Sponsor>> UpdateSponsor(int id, UpdateSponsorDto sponsor)
    {
        var updatedSponsor = await sponsorService.UpdateSponsor(id, sponsor);
        if (updatedSponsor == null)
        {
            return NotFound();
        }
        return Ok(updatedSponsor);
    }

    [Authorize(Roles = "Penningmeester,Secretaris")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSponsor(int id)
    {
        var sponsor = await sponsorService.GetSponsorById(id);
        if (sponsor == null)
        {
            return NotFound();
        }
        await sponsorService.DeleteSponsor(id);
        return NoContent();
    }
}