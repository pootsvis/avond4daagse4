namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class InschrijvingController(
    IInschrijvingService inschrijvingService)
    : ControllerBase
{
    [Authorize(Roles = "voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Inschrijving>>> GetInschrijvingen()
    {
        var inschrijvingen = await inschrijvingService.GetAllInschrijvingen();
        return Ok(inschrijvingen);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Inschrijving>> GetInschrijving(int id)
    {
        var inschrijving = await inschrijvingService.GetInschrijvingById(id);
        if (inschrijving == null)
        {
            return NotFound();
        }
        return Ok(inschrijving);
    }
    
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Inschrijving>> CreateInschrijving(CreateInschrijvingDto inschrijvingDto)
    {
        var createdInschrijving = await inschrijvingService.CreateInschrijving(inschrijvingDto);
        return CreatedAtAction(nameof(GetInschrijving), new { id = createdInschrijving.InschrijvingId }, createdInschrijving);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Inschrijving>> UpdateInschrijving(int id, UpdateInschrijvingDto inschrijvingDto)
    {
        var updatedInschrijving = await inschrijvingService.UpdateInschrijving(id, inschrijvingDto);
        if (updatedInschrijving == null)
        {
            return NotFound();
        }
        return Ok(updatedInschrijving);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInschrijving(int id)
    {
        var inschrijving = await inschrijvingService.GetInschrijvingById(id);
        if (inschrijving == null)
        {
            return NotFound();
        }
        await inschrijvingService.DeleteInschrijving(id);
        return NoContent();
    }
}