namespace avond4daagseBackend.Services;

public class RouteService (applicationDbContext context) : IRouteService
{
    public async Task<List<Route>> GetAllRoutes()
    {
        return await context.Routes.ToListAsync();
    }
    
    public async Task<Route> GetRouteById(int id)
    {
        Route? route = await context.Routes.FindAsync(id);
        if (route == null)
        {
            throw new InvalidOperationException("Route not found");
        }
        return route;
    }
    
    public async Task<Route> CreateRoute(CreateRouteDto routeDto)
    {
        Route route = new()
        {
            Naam = routeDto.Naam,
            Afstand = routeDto.Afstand,
            StartTijd = routeDto.StartTijd,
            Controlepost = routeDto.Controlepost,
            EvenementId = routeDto.EvenementId
        };
        context.Routes.Add(route);
        await context.SaveChangesAsync();
        return route;
    }
    
    public async Task<Route> UpdateRoute(int id, UpdateRouteDto routeDto)
    {
        Route? route = await context.Routes.FindAsync(id);
        if (route == null)
        {
            throw new InvalidOperationException("Route not found");
        }
        route.Naam = routeDto.Naam;
        route.Afstand = routeDto.Afstand;
        route.StartTijd = routeDto.StartTijd;
        route.Controlepost = routeDto.Controlepost;
        context.Routes.Update(route);
        await context.SaveChangesAsync();
        return route;
    }
    
    public async Task<bool> DeleteRoute(int id)
    {
        Route? route = await context.Routes.FindAsync(id);
        if (route == null)
        {
            throw new InvalidOperationException("Route not found");
        }
        context.Routes.Remove(route);
        await context.SaveChangesAsync();
        return true;
    }
}