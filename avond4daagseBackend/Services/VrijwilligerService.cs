namespace Avond4DaagseBackend.Services;

public class VrijwilligerService(ApplicationDbContext context) : IVrijwilligerService
{
    public async Task<List<Vrijwilliger>> GetAllVrijwilligers()
    {
        return await context.Vrijwilligers
            .Include(v => v.Persoon)
            .Include(v => v.Taaktoewijzingen)
            .ToListAsync();
    }

    public async Task<Vrijwilliger> GetVrijwilligerById(int id)
    {
        Vrijwilliger? vrijwilliger = await context.Vrijwilligers
            .Include(v => v.Persoon)
            .Include(v => v.Taaktoewijzingen)
            .FirstOrDefaultAsync(v => v.VrijwilligersId == id);
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
            Persoon = new Persoon
            {
                Voornaam = vrijwilligerDto.Voornaam,
                Achternaam = vrijwilligerDto.Achternaam
            },
            Beschikbaarheid = vrijwilligerDto.Beschikbaarheid,
            Telefoonnummer = vrijwilligerDto.Telefoonnummer,
            Voorkeursrol = vrijwilligerDto.Voorkeursrol
        };
        context.Vrijwilligers.Add(vrijwilliger);
        await context.SaveChangesAsync();
        return vrijwilliger;
    }

    public async Task<Vrijwilliger> UpdateVrijwilliger(int id, UpdateVrijwilligerDto vrijwilligerDto)
    {
        Vrijwilliger vrijwilliger = await GetVrijwilligerById(id);
        vrijwilliger.Beschikbaarheid = vrijwilligerDto.Beschikbaarheid;
        vrijwilliger.Telefoonnummer = vrijwilligerDto.Telefoonnummer;
        vrijwilliger.Voorkeursrol = vrijwilligerDto.Voorkeursrol;
        vrijwilliger.Status = vrijwilligerDto.Status;
        vrijwilliger.Inzetting = vrijwilligerDto.Inzetting;

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
