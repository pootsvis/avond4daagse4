namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class DeelnemerController(
    IDeelnemerService deelnemerService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Deelnemer>>> GetDeelnemers()
    {
        var deelnemers = await deelnemerService.GetAllDeelnemers();
        return Ok(deelnemers);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Deelnemer>> GetDeelnemer(int id)
    {
        var deelnemer = await deelnemerService.GetDeelnemerById(id);
        if (deelnemer == null)
        {
            return NotFound();
        }
        return Ok(deelnemer);
    }
    
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Deelnemer>> CreateDeelnemer(CreateDeelnemerDto deelnemer)
    {
        var createdDeelnemer = await deelnemerService.CreateDeelnemer(deelnemer);
        return CreatedAtAction(nameof(GetDeelnemer), new { id = createdDeelnemer.DeelnemerId }, createdDeelnemer);
    }
    
    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Deelnemer>> UpdateDeelnemer(int id, UpdateDeelnemerDto deelnemer)
    {
        var updatedDeelnemer = await deelnemerService.UpdateDeelnemer(id, deelnemer);
        if (updatedDeelnemer == null)
        {
            return NotFound();
        }
        return Ok(updatedDeelnemer);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDeelnemer(int id)
    {
        var deelnemer = await deelnemerService.GetDeelnemerById(id);
        if (deelnemer == null)
        {
            return NotFound();
        }
        await deelnemerService.DeleteDeelnemer(id);
        return NoContent();
    }
}