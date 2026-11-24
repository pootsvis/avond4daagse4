namespace Avond4DaagseBackend.Services;

public class InschrijvingService(ApplicationDbContext context) : IInschrijvingService
{
    public async Task<List<Inschrijving>> GetAllInschrijvingen()
    {
        return await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .ToListAsync();
    }
    
    public async Task<Inschrijving> GetInschrijvingById(int id)
    {
        // FindAsync kan geen Include doen, daarom FirstOrDefaultAsync
        Inschrijving? inschrijving = await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .FirstOrDefaultAsync(i => i.InschrijvingId == id);
        if (inschrijving == null)
        {
            throw new InvalidOperationException("Inschrijving not found");
        }
        return inschrijving;
    }
    
    public async Task<Inschrijving> CreateInschrijving(CreateInschrijvingDto inschrijvingDto)
    {
        Inschrijving inschrijving = new()
        {
            Inschrijfdatum = DateOnly.FromDateTime(DateTime.Today),
            Status = "Ingediend",
            AantalDeelnemers = inschrijvingDto.AantalDeelnemers,
            EvenementId = inschrijvingDto.EvenementId,
            Contactpersoon = new Contactpersoon
            {
                Email = inschrijvingDto.Contactpersoon?.Email ?? string.Empty,
                Telefoonnummer = inschrijvingDto.Contactpersoon?.Telefoonnummer ?? string.Empty
            }
        };
        context.Inschrijvingen.Add(inschrijving);
        await context.SaveChangesAsync();
        return inschrijving;
    }
    
    public async Task<Inschrijving> UpdateInschrijving(int id, UpdateInschrijvingDto inschrijvingDto)
    {
        Inschrijving? inschrijving = await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .FirstOrDefaultAsync(i => i.InschrijvingId == id);
        if (inschrijving == null)
        {
            throw new InvalidOperationException("Inschrijving not found");
        }

        inschrijving.Status = inschrijvingDto.Status;
        inschrijving.AantalDeelnemers = inschrijvingDto.AantalDeelnemers;

        context.Inschrijvingen.Update(inschrijving);
        await context.SaveChangesAsync();
        return inschrijving;
    }

    public async Task DeleteInschrijving(int id)
    {
        Inschrijving? inschrijving = await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .FirstOrDefaultAsync(i => i.InschrijvingId == id);
        if (inschrijving == null)
        {
            throw new InvalidOperationException("Inschrijving not found");
        }

        context.Inschrijvingen.Remove(inschrijving);
        await context.SaveChangesAsync();
    }
}