namespace DefaultNamespace;

public interface IRolService
{
    Task<List<Rol>> GetAllRollen();
    Task<Rol> GetRolById(int id);
    Task<Rol> CreateRol(CreateRolDto rolDto);
    Task<Rol> UpdateRol(int id, UpdateRolDto rolDto);
    Task<bool> DeleteRol(int id);
}