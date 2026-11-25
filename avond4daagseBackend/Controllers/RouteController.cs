
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<List<RouteResponse>>> GetRoutes()
    {
        List<Route> routes =
            await routeService.GetAllRoutes();

        return Ok(
            routes.Select(r => r.ToResponse()).ToList()
        );
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<RouteResponse>> GetRoute(
        int id
    )
    {
        try
        {
            Route route =
                await routeService.GetRouteById(id);

            return Ok(route.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    public async Task<ActionResult<RouteResponse>> CreateRoute(
        CreateRouteDto dto
    )
    {
        try
        {
            Route route =
                await routeService.CreateRoute(dto);

            Route createdRoute =
                await routeService.GetRouteById(route.RouteId);

            return CreatedAtAction(
                nameof(GetRoute),
                new { id = createdRoute.RouteId },
                createdRoute.ToResponse()
            );
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    public async Task<ActionResult<RouteResponse>> UpdateRoute(
        int id,
        UpdateRouteDto dto
    )
    {
        try
        {
            await routeService.UpdateRoute(id, dto);

            Route route =
                await routeService.GetRouteById(id);

            return Ok(route.ToResponse());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoute(int id)
    {
        try
        {
            await routeService.DeleteRoute(id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
