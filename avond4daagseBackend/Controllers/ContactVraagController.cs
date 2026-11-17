namespace Avond4DaagseBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactVraagController(IContactvraagService contactvraagService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Contactvraag>>> GetContactvragen()
    {
        return Ok(await contactvraagService.GetAllContactvragen());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<Contactvraag>> GetContactvraag(int id)
    {
        return Ok(await contactvraagService.GetContactvraagById(id));
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<Contactvraag>> CreateContactvraag(CreateContactvraagDto contactvraag)
    {
        Contactvraag created = await contactvraagService.CreateContactvraag(contactvraag);
        return CreatedAtAction(nameof(GetContactvraag), new { id = created.ContactvraagId }, created);
    }

    [Authorize(Roles = "Secretaris")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Contactvraag>> UpdateContactvraag(int id, UpdateContactvraagDto contactvraag)
    {
        return Ok(await contactvraagService.UpdateContactvraag(id, contactvraag));
    }

    [Authorize(Roles = "Secretaris")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteContactvraag(int id)
    {
        await contactvraagService.DeleteContactvraag(id);
        return NoContent();
    }
}
