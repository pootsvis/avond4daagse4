namespace avond4daagseBackend.Interfaces;

public interface IRouteService
{
    Task<List<Route>> GetAllRoutes();
    Task<Route> GetRouteById(int id);
    Task<Route> CreateRoute(CreateRouteDto routeDto);
    Task<Route> UpdateRoute(int id, UpdateRouteDto routeDto);
    Task<bool> DeleteRoute(int id);
}