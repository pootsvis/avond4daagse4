namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaaktoewijzingController(ITaakToewijzingService taaktoewijzingService) : ControllerBase
{
    [Authorize(Roles = "Voorzitter, Secretaris, Vrijwilliger, Verkeersregelaar, Penningmeester")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Taaktoewijzing>>> GetTaaktoewijzingen()
    {
        return Ok(await taaktoewijzingService.GetAllTaakToewijzingen());
    }

    [Authorize(Roles = "Voorzitter, Secretaris, Vrijwilliger, Verkeersregelaar, Penningmeester")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Taaktoewijzing>> GetTaaktoewijzing(int id)
    {
        return Ok(await taaktoewijzingService.GetTaakToewijzingById(id));
    }

    [Authorize(Roles = "Voorzitter, Secretaris")]
    [HttpPost]
    public async Task<ActionResult<Taaktoewijzing>> CreateTaaktoewijzing(CreateTaaktoewijzingDto taaktoewijzingDto)
    {
        Taaktoewijzing created = await taaktoewijzingService.CreateTaakToewijzing(taaktoewijzingDto);
        return CreatedAtAction(nameof(GetTaaktoewijzing), new { id = created.ToewijzingId }, created);
    }

    [Authorize(Roles = "Voorzitter, Secretaris")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTaaktoewijzing(int id)
    {
        await taaktoewijzingService.DeleteTaakToewijzing(id);
        return NoContent();
    }
}
