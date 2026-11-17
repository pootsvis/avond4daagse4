using Route = Avond4DaagseBackend.Models.Route;

namespace Avond4DaagseBackend.Controllers;
[ApiController]
[RouteAttribute("api/[controller]")]
public class RouteController(
    IRouteService routeService
    ) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Route>>> GetRoutes()
    {
        var routes = await routeService.GetAllRoutes();
        return Ok(routes);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<Route>> GetRoute(int id)
    {
        var route = await routeService.GetRouteById(id);
        if (route == null)
        {
            return NotFound();
        }
        return Ok(route);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpPost]
    public async Task<ActionResult<Route>> CreateRoute(CreateRouteDto route)
    {
        var createdRoute = await routeService.CreateRoute(route);
        return CreatedAtAction(nameof(GetRoute), new { id = createdRoute.RouteId }, createdRoute);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Route>> UpdateRoute(int id, UpdateRouteDto route)
    {
        var updatedRoute = await routeService.UpdateRoute(id, route);
        if (updatedRoute == null)
        {
            return NotFound();
        }
        return Ok(updatedRoute);
    }

    [Authorize(Roles = "voorzitter")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRoute(int id)
    {
        var route = await routeService.GetRouteById(id);
        if (route == null)
        {
            return NotFound();
        }
        await routeService.DeleteRoute(id);
        return NoContent();
    }
}