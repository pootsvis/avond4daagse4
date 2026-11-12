namespace DefaultNamespace;

public class GebruikerService(
    ApplicationDbContext context,
    IPasswordHasher<Gebruiker> passwordHasher
) : IGebruikerService
{
    public async Task<List<Gebruiker>> GetAllGebruikers()
    {
        return await context.Gebruikers.ToListAsync();
    }
    
    public async Task<Gebruiker> GetGebruikerById(int id)
    {
        Gebruiker? gebruiker = await context.Gebruikers.FindAsync(id);
        if (gebruiker == null)
        {
            throw new InvalidOperationException("Gebruiker not found");
        }
        return gebruiker;
    }
    
    public async Task<Gebruiker> CreateGebruiker(CreateGebruikerDto gebruikerDto)
    {
        Gebruiker gebruiker = new()
        {
            Naam = gebruikerDto.Naam,
            Email = gebruikerDto.Email.Trim().ToLowerInvariant()
        };

        gebruiker.Wachtwoord = passwordHasher.HashPassword(gebruiker, gebruikerDto.Wachtwoord);

        context.Gebruikers.Add(gebruiker);
        await context.SaveChangesAsync();
        return gebruiker;
    }
    
    public async Task<Gebruiker> UpdateGebruiker(int id, UpdateGebruikerDto gebruikerDto)
    {
        Gebruiker? gebruiker = await context.Gebruikers.FindAsync(id);
        if (gebruiker == null)
        {
            throw new InvalidOperationException("Gebruiker not found");
        }
        gebruiker.Naam = gebruikerDto.Naam;
        gebruiker.Email = gebruikerDto.Email.Trim().ToLowerInvariant();
        if (!string.IsNullOrEmpty(gebruikerDto.Wachtwoord))
        {
            gebruiker.Wachtwoord = passwordHasher.HashPassword(gebruiker, gebruikerDto.Wachtwoord);
        }
        context.Gebruikers.Update(gebruiker);
        await context.SaveChangesAsync();
        return gebruiker;
    }
    
    public async Task<bool> DeleteGebruiker(int id)
    {
        Gebruiker? gebruiker = await context.Gebruikers.FindAsync(id);
        if (gebruiker == null)
        {
            throw new InvalidOperationException("Gebruiker not found");
        }
        context.Gebruikers.Remove(gebruiker);
        await context.SaveChangesAsync();
        return true;
    }
}