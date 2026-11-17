namespace Avond4DaagseBackend.Services;

public class RechtService(ApplicationDbContext context) : IRechtService
{
    public async Task<List<Recht>> GetAllRechten()
    {
        return await context.Rechten
            .Include(r => r.RolRechten)
            .ToListAsync();
    }
    
    public async Task<Recht> GetRechtById(int id)
    {
        Recht? recht = await context.Rechten
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
        };
        context.Rechten.Add(recht);
        await context.SaveChangesAsync();
        return recht;
    }

    public async Task<Recht> UpdateRecht(int id, UpdateRechtDto rechtDto)
    {
        Recht recht = await GetRechtById(id);

        recht.Naam = rechtDto.Naam;
        await context.SaveChangesAsync();
        return recht;
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