namespace DefaultNamespace;

public class ContactvraagService(applicationDbContext context) : IContactvraagService
{
    public async Task<List<Contactvraag>> GetAllContactvragen()
    {
        return await context.Contactvragen.ToListAsync();
            .Include(c => c.Gebruiker)
            .ToListAsync();
    }
    
    public async Task<Contactvraag> GetContactvraagById(int id)
    {
        Contactvraag? contactvraag = await context.Contactvragen
            .Include(c => c.Gebruiker)
            .FirstOrDefaultAsync(c => c.ContactvraagId == id);
        if (contactvraag == null)
        {
            throw new InvalidOperationException("Contactvraag not found");
        }
        return contactvraag;
    }
    
    public async Task<Contactvraag> CreateContactvraag(CreateContactvraagDto contactvraagDto)
    {
        Contactvraag contactvraag = new()
        {
            Voornaam = contactvraagDto.Voornaam,
            Achternaam = contactvraagDto.Achternaam,
            Email = contactvraagDto.Email,
            Onderwerp = contactvraagDto.Onderwerp,
            Bericht = contactvraagDto.Bericht,
            Datum = DateOnly.FromDateTime(DateTime.Now),
            Status = "Nieuw",
            Persoon = new Persoon
            {
                Voornaam = contactvraagDto.Voornaam,
                Achternaam = contactvraagDto.Achternaam
            }
        };
        context.Contactvragen.Add(contactvraag);
        await context.SaveChangesAsync();
        return contactvraag;
    }
    
    public async Task<Contactvraag> UpdateContactvraag(int id, UpdateContactvraagDto contactvraagDto)
    {
        Contactvraag? contactvraag = await context.Contactvragen.FindAsync(id);
        if (contactvraag == null)
        {
            throw new InvalidOperationException("Contactvraag not found");
        }
        contactvraag.Status = contactvraagDto.Status;
        contactvraag.Conceptreactie = contactvraagDto.Conceptreactie;
        context.Contactvragen.Update(contactvraag);
        await context.SaveChangesAsync();
        return contactvraag;
    }
    
    public async Task<bool> DeleteContactvraag(int id)
    {
        Contactvraag? contactvraag = await context.Contactvragen.FindAsync(id);
        if (contactvraag == null)
        {
            throw new InvalidOperationException("Contactvraag not found");
        }
        context.Contactvragen.Remove(contactvraag);
        await context.SaveChangesAsync();
        return true;
    }
}

