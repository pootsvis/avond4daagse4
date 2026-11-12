namespace avond4daagseBackend.Services;

public class RechtService(applicationDbContext context) : IRechtService
{
    public async Task<List<Recht>> GetAllRechten()
    {
        return await context.Rechten.ToListAsync();
            .Include(r => r.RolRechten)
            .ToListAsync();
    }
    
    public async Task<Recht> GetRechtById(int id)
    {
        Recht? recht = await context.Rechten.FindAsync(id);
            .Include(r => r.RolRechten)
            .FirstOrDefaultAsync(e => e.RechtId == id);
        if (recht == null)
        {
            throw new InvalidOperationException("Recht not found");
        }
        return recht;
    }
    
    public async Task<Recht> CreateRecht(CreateRechtDto rechtDto)
    {
        Recht recht = new()
        {
            Naam = rechtDto.Naam
            RolRechten = rechtIds
                .Select(rechtId => new RolRecht { RechtId = rechtId })
                .ToList()
        };
        context.Rechten.Add(recht);
        await context.SaveChangesAsync();
        return recht;
    }

    public async Task<Recht> UpdateRecht(int id, UpdateRechtDto rechtDto)
    {
        Recht recht = await GetRechtById(id);

        List<int> rolIds = rechtDto.RolIds.Distinct().ToList();
        await CheckRollenExist(rolIds);

        recht.Naam = rechtDto.Naam;

        // Koppeltabel bijwerken: alleen verwijderen wat weg moet, alleen toevoegen wat nieuw is
        HashSet<int> huidigeIds = recht.RolRechten.Select(rr => rr.RolId).ToHashSet();
        HashSet<int> nieuweIds = rolIds.ToHashSet();

        foreach (RolRecht teVerwijderen in recht.RolRechten
                     .Where(rr => !nieuweIds.Contains(rr.RolId))
                     .ToList())
        {
            context.RolRechten.Remove(teVerwijderen);
        }

        foreach (int rolId in nieuweIds.Where(rid => !huidigeIds.Contains(rid)))
        {
            recht.RolRechten.Add(new RolRecht { RolId = rolId });
        }
    }
    public async Task<bool> DeleteRecht(int id)
    {
        Recht? recht = await context.Rechten.FindAsync(id);
        if (recht == null)
        {
            throw new InvalidOperationException("Recht not found");
        }
        context.Rechten.Remove(recht);
        await context.SaveChangesAsync();
        return true;
    }
}