namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class VrijwilligerController(
    IVrijwilligerService vrijwilligerService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vrijwilliger>>> GetVrijwilligers()
    {
        var vrijwilligers = await vrijwilligerService.GetAllVrijwilligers();
        return Ok(vrijwilligers);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Vrijwilliger>> GetVrijwilliger(int id)
    {  
        var vrijwilliger = await vrijwilligerService.GetVrijwilligerById(id);
            if (vrijwilliger == null)
            {
                return NotFound();
            }
            return Ok(vrijwilliger);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Vrijwilliger>> CreateVrijwilliger(CreateVrijwilligerDto vrijwilliger)
    {
        var createdVrijwilliger = await vrijwilligerService.CreateVrijwilliger(vrijwilliger);
        return CreatedAtAction(nameof(GetVrijwilliger), new { id = createdVrijwilliger.VrijwilligersId }, createdVrijwilliger);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateVrijwilliger(int id, UpdateVrijwilligerDto vrijwilliger)
    {
        var existingVrijwilliger = await vrijwilligerService.GetVrijwilligerById(id);
        if (existingVrijwilliger == null)
        {
            return NotFound();
        }

        await vrijwilligerService.UpdateVrijwilliger(id, vrijwilliger);
        return NoContent();
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVrijwilliger(int id)
    {
        var existingVrijwilliger = await vrijwilligerService.GetVrijwilligerById(id);
        if (existingVrijwilliger == null)
        {
            return NotFound();
        }

        await vrijwilligerService.DeleteVrijwilliger(id);
        return NoContent();
    }
}