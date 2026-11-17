namespace avond4daagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class GebruikerController(
    IGebruikerService gebruikerService
    ) : ControllerBase
{
    [Authorize(Roles = "Voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Gebruiker>>> GetGebruikers()
    {
        var gebruikers = await gebruikerService.GetAllGebruikers();
        return Ok(gebruikers);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Gebruiker>> GetGebruiker(int id)
    {
        var gebruiker = await gebruikerService.GetGebruikerById(id);
        if (gebruiker == null)
        {
            return NotFound();
        }
        return Ok(gebruiker);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Gebruiker>> CreateGebruiker(CreateGebruikerDto gebruiker)
    {
        var createdGebruiker = await gebruikerService.CreateGebruiker(gebruiker);
        return CreatedAtAction(nameof(GetGebruiker), new { id = createdGebruiker.GebruikerId }, createdGebruiker);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Gebruiker>> UpdateGebruiker(int id, UpdateGebruikerDto gebruiker)
    {
        var updatedGebruiker = await gebruikerService.UpdateGebruiker(id, gebruiker);
        if (updatedGebruiker == null)
        {
            return NotFound();
        }
        return Ok(updatedGebruiker);
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGebruiker(int id)
    {
        var gebruiker = await gebruikerService.GetGebruikerById(id);
        if (gebruiker == null)
        {
            return NotFound();
        }
        await gebruikerService.DeleteGebruiker(id);
        return NoContent();
    }
}