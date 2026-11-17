namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class RolController(
    IRolService rolService
    ) : ControllerBase
{
    [Authorize(Roles = "voorzitter")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Rol>>> GetRollen()
    {
        var rollen = await rolService.GetAllRollen();
        return Ok(rollen);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Rol>> GetRol(int id)
    {
        var rol = await rolService.GetRolById(id);
        if (rol == null)
        {
            return NotFound();
        }
        return Ok(rol);
    }
    
    [Authorize(Roles = "voorzitter")]
    [HttpPost("{rolId}/gebruikers/{gebruikerId}")]
    public async Task<ActionResult<RolResponse>> AssignRol(int rolId, int gebruikerId)
    {
        try
        {
            Rol rol = await rolService.AssignRol(rolId, gebruikerId);
            return Ok(ToResponse(rol));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);   // "Rol not found" of "Gebruiker not found"
        }
    }

    private static RolResponse ToResponse(Rol rol)
    {
        return new RolResponse
        {
            RolId = rol.RolId,
            Naam = rol.Naam,
            RechtIds = rol.RolRechten.Select(rr => rr.RechtId).ToList()
        };
    }
}