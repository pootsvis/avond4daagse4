namespace Avond4DaagseBackend.Services;

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
    
    public async Task<Gebruiker> ValidateLogin(string email, string wachtwoord)
    {
        string genormaliseerdeEmail = email.Trim().ToLowerInvariant();
        Gebruiker? gebruiker = await context.Gebruikers
            .Include(g => g.GebruikerRollen)
            .ThenInclude(gr => gr.Rol)
            .FirstOrDefaultAsync(g => g.Email == genormaliseerdeEmail);

        if (gebruiker == null)
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        PasswordVerificationResult resultaat =
            passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, wachtwoord);
        if (resultaat == PasswordVerificationResult.Failed)
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        return gebruiker;
    }
    
    private const string StandaardRol = "gebruiker";

    public async Task<Gebruiker> Register(RegisterDto registerDto)
    {
        string email = registerDto.Email.Trim().ToLowerInvariant();
        if (await context.Gebruikers.AnyAsync(g => g.Email == email))
        {
            throw new InvalidOperationException("Email already in use");
        }

        Rol? standaardRol = await context.Rollen.FirstOrDefaultAsync(r => r.Naam == StandaardRol);
        if (standaardRol == null)
        {
            throw new InvalidOperationException("Default rol not found");
        }

        Gebruiker gebruiker = new()
        {
            Naam = registerDto.Naam,
            Email = email
        };
        gebruiker.Wachtwoord = passwordHasher.HashPassword(gebruiker, registerDto.Wachtwoord);
        gebruiker.GebruikerRollen.Add(new GebruikerRol { RolId = standaardRol.RolId });

        context.Gebruikers.Add(gebruiker);
        await context.SaveChangesAsync();
        return gebruiker;
    }
}