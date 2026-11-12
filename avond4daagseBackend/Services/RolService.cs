namespace avond4daagseBackend.Services;

public class RolService(applicationDbContext context) : IRolService
{
    public async Task<List<Rol>> GetAllRollen()
    {
        return await context.Rollen.ToListAsync();
            .Include(r => r.RolRechten)
            .ToListAsync();
    }
    
    public async Task<Rol> GetRolById(int id)
    {
        Rol? rol = await context.Rollen.FindAsync(id);
            .Include(r => r.RolRechten)
            .FirstOrDefaultAsync(e => e.RolId == id);
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
            RolRechten = rechtIds
                .Select(rechtId => new RolRecht { RechtId = rechtId })
                .ToList()
        };
        context.Rollen.Add(rol);
        await context.SaveChangesAsync();
    }
    
    public async Task<Rol> UpdateRol(int id, UpdateRolDto rolDto)
    {
        Rol rol = await GetRolById(id);
 
        List<int> rechtIds = rolDto.RechtIds.Distinct().ToList();
        await CheckRechtenExist(rechtIds);
 
        rol.Naam = rolDto.Naam;
 
        // Koppeltabel bijwerken: alleen verwijderen wat weg moet, alleen toevoegen wat nieuw is
        HashSet<int> huidigeIds = rol.RolRechten.Select(rr => rr.RechtId).ToHashSet();
        HashSet<int> nieuweIds = rechtIds.ToHashSet();
 
        foreach (RolRecht teVerwijderen in rol.RolRechten
                     .Where(rr => !nieuweIds.Contains(rr.RechtId))
                     .ToList())
        {
            context.RolRechten.Remove(teVerwijderen);
        }
 
        foreach (int rechtId in nieuweIds.Where(rid => !huidigeIds.Contains(rid)))
        {
            rol.RolRechten.Add(new RolRecht { RechtId = rechtId });
        }
 
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