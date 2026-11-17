namespace Avond4DaagseBackend.Services;

public class TaakToewijzingService(ApplicationDbContext context) : ITaakToewijzingService
{
    public async Task<List<Taaktoewijzing>> GetAllTaakToewijzingen()
    {
        return await context.Taaktoewijzingen
            .Include(t => t.Vrijwilliger)
            .Include(t => t.Draaiboektaak)
            .ToListAsync();
    }

    public async Task<Taaktoewijzing> GetTaakToewijzingById(int id)
    {
        Taaktoewijzing? toewijzing = await context.Taaktoewijzingen
            .Include(t => t.Vrijwilliger)
            .Include(t => t.Draaiboektaak)
            .FirstOrDefaultAsync(t => t.ToewijzingId == id);
        if (toewijzing == null)
        {
            throw new InvalidOperationException("Taaktoewijzing not found");
        }
        return toewijzing;
    }

    public async Task<Taaktoewijzing> CreateTaakToewijzing(CreateTaaktoewijzingDto dto)
    {
        Taaktoewijzing toewijzing = new()
        {
            VrijwilligersId = dto.VrijwilligersId,
            TaakId = dto.TaakId
        };
        context.Taaktoewijzingen.Add(toewijzing);
        await context.SaveChangesAsync();
        return toewijzing;
    }

    public async Task<bool> DeleteTaakToewijzing(int id)
    {
        Taaktoewijzing toewijzing = await GetTaakToewijzingById(id);
        context.Taaktoewijzingen.Remove(toewijzing);
        await context.SaveChangesAsync();
        return true;
    }
}
