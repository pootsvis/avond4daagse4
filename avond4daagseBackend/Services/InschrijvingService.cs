namespace avond4daagseBackend.Services;

public class InschijvingService(
    ApplicationDbContext context
) : IInschijvingService
{
    public async Task<List<Inschrijving>> GetAllInschrijvingen()
    {
        return await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .ToListAsync();
    }
    
    public async Task<Inschrijving> GetInschijvingById(int id)
    {
        // FindAsync kan geen Include doen, daarom FirstOrDefaultAsync
        Inschijving? inschijving = await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .FirstOrDefaultAsync(i => i.InschrijvingId == id);
        if (inschijving == null)
        {
            throw new InvalidOperationException("Inschijving not found");
        }
        return inschijving;
    }
    
    public async Task<Inschrijving> CreateInschrijving(CreateInschrijvingDto inschijvingDto)
    {
        Inschrijving inschrijving = new()
        {
            Inschrijfdatum = inschijvingDto.Inschrijfdatum,
            Status = inschijvingDto.Status,
            AantalDeelnemers = inschijvingDto.AantalDeelnemers,
            EvenementId = inschijvingDto.EvenementId,
            Contactpersoon = new Contactpersoon
            {
                Email = inschijvingDto.Contactpersoon.Email,
                Telefoonnummer = inschijvingDto.Contactpersoon.Telefoonnummer
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

        inschrijving.Inschrijfdatum = inschrijvingDto.Inschrijfdatum;
        inschrijving.Status = inschrijvingDto.Status;
        inschrijving.AantalDeelnemers = inschrijvingDto.AantalDeelnemers;
        inschrijving.EvenementId = inschrijvingDto.EvenementId;

        // Update the associated Contactpersoon
        if (inschrijving.Contactpersoon != null)
        {
            inschrijving.Contactpersoon.Email = inschrijvingDto.Contactpersoon.Email;
            inschrijving.Contactpersoon.Telefoonnummer = inschrijvingDto.Contactpersoon.Telefoonnummer;
        }

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