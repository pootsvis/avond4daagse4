namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class RechtController(
    IRechtService rechtService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recht>>> GetRechten()
    {
        var rechten = await rechtService.GetAllRechten();
        return Ok(rechten);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Recht>> GetRecht(int id)
    {
        var recht = await rechtService.GetRechtById(id);
        if (recht == null)
        {
            return NotFound();
        }
        return Ok(recht);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Recht>> CreateRecht(CreateRechtDto recht)
    {
        var createdRecht = await rechtService.CreateRecht(recht);
        return CreatedAtAction(nameof(GetRecht), new { id = createdRecht.RechtId }, createdRecht);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Recht>> UpdateRecht(int id, UpdateRechtDto recht)
    {
        var updatedRecht = await rechtService.UpdateRecht(id, recht);
        if (updatedRecht == null)
        {
            return NotFound();
        }
        return Ok(updatedRecht);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRecht(int id)
    {
        var recht = await rechtService.GetRechtById(id);
        if (recht == null)
        {
            return NotFound();
        }
        await rechtService.DeleteRecht(id);
        return NoContent();
    }
}