namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DraaiboekController(IDraaiboektaakService draaiboektaakService) : ControllerBase
{
    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Draaiboektaak>>> GetDraaiboektaken()
    {
        return Ok(await draaiboektaakService.GetAllDraaiboektaken());
    }

    [Authorize(Roles = "Voorzitter,Secretaris,Verkeersregelaars,Penningmeester,Vrijwilliger")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Draaiboektaak>> GetDraaiboektaak(int id)
    {
        return Ok(await draaiboektaakService.GetDraaiboektaakById(id));
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Draaiboektaak>> CreateDraaiboektaak(CreateDraaiboektaakDto dto)
    {
        Draaiboektaak created = await draaiboektaakService.CreateDraaiboektaak(dto);
        return CreatedAtAction(nameof(GetDraaiboektaak), new { id = created.TaakId }, created);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Draaiboektaak>> UpdateDraaiboektaak(int id, UpdateDraaiboektaakDto dto)
    {
        return Ok(await draaiboektaakService.UpdateDraaiboektaak(id, dto));
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDraaiboektaak(int id)
    {
        await draaiboektaakService.DeleteDraaiboektaak(id);
        return NoContent();
    }
}
