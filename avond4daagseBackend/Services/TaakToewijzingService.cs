using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Services;

public class TaakToewijzingService(
    ApplicationDbContext context
) : ITaakToewijzingService
{
    public async Task<List<Taaktoewijzing>> GetAllTaaktoewijzingen()
    {
        return await context.Taaktoewijzingen.ToListAsync();
    }

    public async Task<Taaktoewijzing> GetTaaktoewijzingById(int id)
    {
        Taaktoewijzing? taaktoewijzing = await context.Taaktoewijzingen.FindAsync(id);
        if (taaktoewijzing == null)
        {
            throw new InvalidOperationException("Taaktoewijzing not found");
        }
        return taaktoewijzing;
    }

    public async Task<Taaktoewijzing> CreateTaaktoewijzing(CreateTaaktoewijzingDto taaktoewijzingDto)
    {
        // Beide FK's moeten bestaan, anders krijg je een databasefout
        bool vrijwilligerBestaat = await context.Vrijwilligers
            .AnyAsync(v => v.VrijwilligersId == taaktoewijzingDto.VrijwilligersId);
        if (!vrijwilligerBestaat)
        {
            throw new InvalidOperationException("Vrijwilliger not found");
        }

        bool taakBestaat = await context.Draaiboektaken
            .AnyAsync(t => t.TaakId == taaktoewijzingDto.TaakId);
        if (!taakBestaat)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }

        Taaktoewijzing taaktoewijzing = new()
        {
            VrijwilligersId = taaktoewijzingDto.VrijwilligersId,
            TaakId = taaktoewijzingDto.TaakId
        };
        context.Taaktoewijzingen.Add(taaktoewijzing);
        await context.SaveChangesAsync();
        return taaktoewijzing;
    }

    public async Task DeleteTaaktoewijzing(int id)
    {
        Taaktoewijzing taaktoewijzing = await GetTaaktoewijzingById(id);
        context.Taaktoewijzingen.Remove(taaktoewijzing);
        await context.SaveChangesAsync();
    }
}