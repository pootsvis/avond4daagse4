namespace avond4daagseBackend.Services;

public class VrijwilligerService(applicationDbContext context) : IVrijwilligerService
{
    public async Task<List<Vrijwilliger>> GetAllVrijwilligers()
    {
        return await context.Vrijwilligers.ToListAsync();
            .include(v => v.VrijwilligerTaken)
            .ToListAsync();
    }
    
    public async Task<Vrijwilliger> GetVrijwilligerById(int id)
    {
        Vrijwilliger? vrijwilliger = await context.Vrijwilligers.FindAsync(id);
            .include(v => v.VrijwilligerTaken)
            .FirstOrDefaultAsync(e => e.VrijwilligerId == id);
        if (vrijwilliger == null)
        {
            throw new InvalidOperationException("Vrijwilliger not found");
        }
        return vrijwilliger;
    }
    
    public async Task<Vrijwilliger> CreateVrijwilliger(CreateVrijwilligerDto vrijwilligerDto)
    {
        Vrijwilliger vrijwilliger = new()
        {
            Voornaam = vrijwilligerDto.Voornaam,
            Achternaam = vrijwilligerDto.Achternaam,
            Email = vrijwilligerDto.Email,
            Telefoonnummer = vrijwilligerDto.Telefoonnummer,
            VrijwilligerTaken = taakIds
                .Select(taakId => new VrijwilligerTaak { TaakId = taakId })
                .ToList()
        };
        context.Vrijwilligers.Add(vrijwilliger);
        await context.SaveChangesAsync();
    }
    
    public async Task<Vrijwilliger> UpdateVrijwilliger(int id, UpdateVrijwilligerDto vrijwilligerDto)
    {
        Vrijwilliger vrijwilliger = await GetVrijwilligerById(id);

        List<int> taakIds = vrijwilligerDto.TaakIds.Distinct().ToList();
        await CheckTakenExist(taakIds);

        vrijwilliger.Voornaam = vrijwilligerDto.Voornaam;
        vrijwilliger.Achternaam = vrijwilligerDto.Achternaam;
        vrijwilliger.Email = vrijwilligerDto.Email;
        vrijwilliger.Telefoonnummer = vrijwilligerDto.Telefoonnummer;

        // Koppeltabel bijwerken: alleen verwijderen wat weg moet, alleen toevoegen wat nieuw is
        HashSet<int> huidigeIds = vrijwilliger.VrijwilligerTaken.Select(vt => vt.TaakId).ToHashSet();
        HashSet<int> nieuweIds = taakIds.ToHashSet();

        foreach (VrijwilligerTaak teVerwijderen in vrijwilliger.VrijwilligerTaken
                     .Where(vt => !nieuweIds.Contains(vt.TaakId))
                     .ToList())
        {
            context.VrijwilligerTaken.Remove(teVerwijderen);
        }

        foreach (int taakId in nieuweIds.Where(tid => !huidigeIds.Contains(tid)))
        {
            vrijwilliger.VrijwilligerTaken.Add(new VrijwilligerTaak { TaakId = taakId });
        }

        context.Vrijwilligers.Update(vrijwilliger);
        await context.SaveChangesAsync();
        return vrijwilliger;
    }
    
    public async Task<bool> DeleteVrijwilliger(int id)
    {
        Vrijwilliger? vrijwilliger = await context.Vrijwilligers.FindAsync(id);
        if (vrijwilliger == null)
        {
            throw new InvalidOperationException("Vrijwilliger not found");
        }
        context.Vrijwilligers.Remove(vrijwilliger);
        await context.SaveChangesAsync();
        return true;
    }
}