namespace DefaultNamespace;

public class RolService(applicationDbContext context) : IRolService
{
    public async Task<List<Rol>> GetAllRollen()
    {
        return await context.Rollen.ToListAsync();
    }
    
    public async Task<Rol> GetRolById(int id)
    {
        Rol? rol = await context.Rollen.FindAsync(id);
        if (rol == null)
        {
            throw new InvalidOperationException("Rol not found");
        }
        return rol;
    }
    
    public async Task<Rol> CreateRol(CreateRolDto rolDto)
    {
        Rol rol = new()
        {
            Naam = rolDto.Naam,
            Beschrijving = rolDto.Beschrijving
        };
        context.Rollen.Add(rol);
        await context.SaveChangesAsync();
        return rol;
    }
    
    public async Task<Rol> UpdateRol(int id, UpdateRolDto rolDto)
    {
        Rol? rol = await context.Rollen.FindAsync(id);
        if (rol == null)
        {
            throw new InvalidOperationException("Rol not found");
        }
        rol.Naam = rolDto.Naam;
        rol.Beschrijving = rolDto.Beschrijving;
        context.Rollen.Update(rol);
        await context.SaveChangesAsync();
        return rol;
    }

    public async Task<bool> DeleteRol(int id)
    {
        Rol? rol = await context.Rollen.FindAsync(id);
        if (rol == null)
        {
            throw new InvalidOperationException("Rol not found");
        }
        context.Rollen.Remove(rol);
        await context.SaveChangesAsync();
        return true;
    }
    
}