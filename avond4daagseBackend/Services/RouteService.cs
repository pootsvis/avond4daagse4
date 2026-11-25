
using System.Text.Json;
using Route = Avond4DaagseBackend.Models.Route;

namespace Avond4DaagseBackend.Services;

public class RouteService(
    ApplicationDbContext context
) : IRouteService
{
    private static string SerializeGpxPoints(
        double[][] points
    )
    {
        if (points == null ||
            points.Length == 1 ||
            points.Length > 5000)
        {
            throw new ArgumentException(
                "Een GPX-route moet 0 of 2 tot 5000 punten bevatten."
            );
        }

        foreach (var point in points)
        {
            if (point == null ||
                point.Length != 2 ||
                !double.IsFinite(point[0]) ||
                !double.IsFinite(point[1]) ||
                Math.Abs(point[0]) > 90 ||
                Math.Abs(point[1]) > 180)
            {
                throw new ArgumentException(
                    "Ongeldige GPX-coördinaten."
                );
            }
        }

        return JsonSerializer.Serialize(points);
    }

    // GET - ALLE ROUTES

    public async Task<List<Route>> GetAllRoutes()
    {
        return await context.Routes
            .Include(r => r.Evenement)
            .ToListAsync();
    }

    // GET - EEN ROUTE

    public async Task<Route> GetRouteById(int id)
    {
        Route? route = await context.Routes
            .Include(r => r.Evenement)
            .FirstOrDefaultAsync(r => r.RouteId == id);

        if (route == null)
        {
            throw new InvalidOperationException(
                "Route not found"
            );
        }

        return route;
    }

    // POST

    public async Task<Route> CreateRoute(
        CreateRouteDto routeDto
    )
    {
        bool evenementBestaat =
            await context.Evenementen.AnyAsync(
                e => e.EvenementId == routeDto.EvenementId
            );

        if (!evenementBestaat)
        {
            throw new InvalidOperationException(
                "Evenement not found"
            );
        }

        Route route = new()
        {
            Naam = routeDto.Naam,
            Afstand = routeDto.Afstand,
            Starttijd = routeDto.Starttijd,
            Controlepost = routeDto.Controlepost,
            EvenementId = routeDto.EvenementId,

            Wandelavond = routeDto.Wandelavond,
            Startlocatie = routeDto.Startlocatie,

            GpxPuntenJson = SerializeGpxPoints(
                routeDto.GpxPunten
            )
        };

        context.Routes.Add(route);

        await context.SaveChangesAsync();

        return route;
    }

    // PUT

    public async Task<Route> UpdateRoute(
        int id,
        UpdateRouteDto routeDto
    )
    {
        Route? route =
            await context.Routes.FindAsync(id);

        if (route == null)
        {
            throw new InvalidOperationException(
                "Route not found"
            );
        }

        string? nieuweGpx = routeDto.GpxPunten == null
            ? null
            : SerializeGpxPoints(routeDto.GpxPunten);

        route.Naam = routeDto.Naam;
        route.Afstand = routeDto.Afstand;
        route.Starttijd = routeDto.Starttijd;
        route.Controlepost = routeDto.Controlepost;

        // Oudere clients die geen GPX-gegevens meesturen
        // overschrijven de nieuwe routevelden niet.
        if (nieuweGpx != null)
        {
            route.Wandelavond = routeDto.Wandelavond;
            route.Startlocatie = routeDto.Startlocatie;
            route.GpxPuntenJson = nieuweGpx;
        }

        await context.SaveChangesAsync();

        return route;
    }

    // DELETE

    public async Task<bool> DeleteRoute(int id)
    {
        Route? route =
            await context.Routes.FindAsync(id);

        if (route == null)
        {
            throw new InvalidOperationException(
                "Route not found"
            );
        }

        context.Routes.Remove(route);

        await context.SaveChangesAsync();

        return true;
    }
}
