namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EvenementController(
    IEvenementService evenementService
    ) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Evenement>>> GetEvenementen()
    {
        var evenementen = await evenementService.GetAllEvenementen();
        return Ok(evenementen);
    }
    
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<Evenement>> GetEvenement(int id)
    {
        var evenement = await evenementService.GetEvenementById(id);
        if (evenement == null)
        {
            return NotFound();
        }
        return Ok(evenement);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Evenement>> CreateEvenement(CreateEvenementDto evenement)
    {
        var createdEvenement = await evenementService.CreateEvenement(evenement);
        return CreatedAtAction(nameof(GetEvenement), new { id = createdEvenement.EvenementId }, createdEvenement);
    }
    
    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Evenement>> UpdateEvenement(int id, UpdateEvenementDto evenement)
    {
        var updatedEvenement = await evenementService.UpdateEvenement(id, evenement);
        if (updatedEvenement == null)
        {
            return NotFound();
        }
        return Ok(updatedEvenement);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEvenement(int id)
    {
        var evenement = await evenementService.GetEvenementById(id);
        if (evenement == null)
        {
            return NotFound();
        }
        await evenementService.DeleteEvenement(id);
        return NoContent();
    }
}