namespace Avond4DaagseBackend.Services;

public class DraaiboektaakService(ApplicationDbContext context) : IDraaiboektaakService
{
    public async Task<List<Draaiboektaak>> GetAllDraaiboektaken()
    {
        return await context.Draaiboektaken
            .Include(d => d.GebruikerDraaiboektaken)
            .ToListAsync();
    }

    public async Task<Draaiboektaak> GetDraaiboektaakById(int id)
    {
        Draaiboektaak? draaiboektaak = await context.Draaiboektaken
            .Include(d => d.GebruikerDraaiboektaken)
            .FirstOrDefaultAsync(d => d.TaakId == id);
        if (draaiboektaak == null)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }
        return draaiboektaak;
    }

    public async Task<Draaiboektaak> CreateDraaiboektaak(CreateDraaiboektaakDto draaiboektaakDto)
    {
        List<int> gebruikerIds = draaiboektaakDto.GebruikerIds.Distinct().ToList();
        await CheckGebruikersExist(gebruikerIds);

        Draaiboektaak draaiboektaak = new()
        {
            Titel = draaiboektaakDto.Titel,
            Beschrijving = draaiboektaakDto.Beschrijving,
            Datum = draaiboektaakDto.Datum,
            Categorie = draaiboektaakDto.Categorie,
            Status = draaiboektaakDto.Status,
            Verantwoordelijke = draaiboektaakDto.Verantwoordelijke,
            GebruikerDraaiboektaken = gebruikerIds
                .Select(gebruikerId => new GebruikerDraaiboektaak { GebruikerId = gebruikerId })
                .ToList()
        };
        context.Draaiboektaken.Add(draaiboektaak);
        await context.SaveChangesAsync();
        return draaiboektaak;
    }

    public async Task<Draaiboektaak> UpdateDraaiboektaak(int id, UpdateDraaiboektaakDto draaiboektaakDto)
    {
        Draaiboektaak draaiboektaak = await GetDraaiboektaakById(id);
        List<int> gebruikerIds = draaiboektaakDto.GebruikerIds.Distinct().ToList();
        await CheckGebruikersExist(gebruikerIds);

        draaiboektaak.Titel = draaiboektaakDto.Titel;
        draaiboektaak.Beschrijving = draaiboektaakDto.Beschrijving;
        draaiboektaak.Datum = draaiboektaakDto.Datum;
        draaiboektaak.Categorie = draaiboektaakDto.Categorie;
        draaiboektaak.Status = draaiboektaakDto.Status;
        draaiboektaak.Verantwoordelijke = draaiboektaakDto.Verantwoordelijke;

        HashSet<int> huidigeIds = draaiboektaak.GebruikerDraaiboektaken
            .Select(gd => gd.GebruikerId)
            .ToHashSet();
        HashSet<int> nieuweIds = gebruikerIds.ToHashSet();
        foreach (GebruikerDraaiboektaak teVerwijderen in draaiboektaak.GebruikerDraaiboektaken
                     .Where(gd => !nieuweIds.Contains(gd.GebruikerId))
                     .ToList())
        {
            context.GebruikerDraaiboektaken.Remove(teVerwijderen);
        }
        foreach (int gebruikerId in nieuweIds.Where(gid => !huidigeIds.Contains(gid)))
        {
            draaiboektaak.GebruikerDraaiboektaken.Add(new GebruikerDraaiboektaak { GebruikerId = gebruikerId });
        }

        await context.SaveChangesAsync();
        return draaiboektaak;
    }

    public async Task<bool> DeleteDraaiboektaak(int id)
    {
        Draaiboektaak? draaiboektaak = await context.Draaiboektaken.FindAsync(id);
        if (draaiboektaak == null)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }
        context.Draaiboektaken.Remove(draaiboektaak);
        await context.SaveChangesAsync();
        return true;
    }

    private async Task CheckGebruikersExist(List<int> gebruikerIds)
    {
        int aantalGevonden = await context.Gebruikers.CountAsync(g => gebruikerIds.Contains(g.GebruikerId));
        if (aantalGevonden != gebruikerIds.Count)
        {
            throw new InvalidOperationException("Gebruiker not found");
        }
    }
}
