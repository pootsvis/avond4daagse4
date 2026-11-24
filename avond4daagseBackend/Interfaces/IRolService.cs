using Avond4DaagseBackend.Interfaces;

namespace Avond4DaagseBackend.Interfaces;

public interface IRolService
{
    Task<List<Rol>> GetAllRollen();
    Task<Rol> GetRolById(int id);
    Task<Rol> AssignRol(int rolId, int gebruikerId);
}