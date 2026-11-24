
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
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
    // Iedereen mag de beschikbare routes bekijken.
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(List<RouteResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RouteResponse>>> GetRoutes()
    {
        List<Route> routes = await routeService.GetAllRoutes();

        return Ok(routes.Select(r => r.ToResponse()).ToList());
    }

    // Iedereen mag een specifieke route bekijken.
    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RouteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RouteResponse>> GetRoute(int id)
    {
        try
        {
            Route route = await routeService.GetRouteById(id);

            return Ok(route.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // Alleen de voorzitter mag routes toevoegen.
    [Authorize(Roles = "Voorzitter")]
    [HttpPost]
    [ProducesResponseType(typeof(RouteResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RouteResponse>> CreateRoute(CreateRouteDto dto)
    {
        try
        {
            Route route = await routeService.CreateRoute(dto);

            Route createdRoute =
                await routeService.GetRouteById(route.RouteId);

            return CreatedAtAction(
                nameof(GetRoute),
                new { id = createdRoute.RouteId },
                createdRoute.ToResponse()
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Alleen de voorzitter mag routes aanpassen.
    // De rolnaam is nu correct: Voorzitter.
    [Authorize(Roles = "Voorzitter")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(RouteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RouteResponse>> UpdateRoute(
        int id,
        UpdateRouteDto dto
    )
    {
        try
        {
            await routeService.UpdateRoute(id, dto);

            Route route = await routeService.GetRouteById(id);

            return Ok(route.ToResponse());
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // Alleen de voorzitter mag routes verwijderen.
    // Ook hier is de rolnaam correct: Voorzitter.
    [Authorize(Roles = "Voorzitter")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteRoute(int id)
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
