namespace avond4daagseBackend.Services;

public class DeelnemerService(applicationDbContext context) : IDeelnemerService
{
    public Task<List<Deelnemer>> GetAllDeelnemers()
    {
        return await _context.Deelnemers.ToListAsync();
            .include(d => d.persoon)
            .include(d => d.deelname)
            .toListAsync();
    }
    
    public async Task<Deelnemer> GetDeelnemerById(int id)
    {
        Deelnemer? deelnemer = await _context.Deelnemers.FindAsync(id);
            .include(d => d.persoon)
            .include(d => d.deelname)
            .FirstOrDefaultAsync(e => e.DeelnemerId == id);
        if (deelnemer == null)
        {
            throw new InvalidOperationException("Deelnemer not found");
        }
        return deelnemer;
    }
    
    public async Task<Deelnemer> CreateDeelnemer(CreateDeelnemerDto deelnemerDto)
    {
        Deelnemer deelnemer = new()
        {
            Voornaam = deelnemerDto.Voornaam,
            Achternaam = deelnemerDto.Achternaam,
            Geboortedatum = deelnemerDto.Geboortedatum,
            Email = deelnemerDto.Email,
            Telefoonnummer = deelnemerDto.Telefoonnummer,
            DeelnameId = deelnemerDto.DeelnameId
        };
        _context.Deelnemers.Add(deelnemer);
        await _context.SaveChangesAsync();
        return deelnemer;
    }
    
    public async Task<Deelnemer> UpdateDeelnemer(int id, UpdateDeelnemerDto deelnemerDto)
    {
        Deelnemer? deelnemer = await _context.Deelnemers.FindAsync(id);
        if (deelnemer == null)
        {
            throw new InvalidOperationException("Deelnemer not found");
        }
        deelnemer.Voornaam = deelnemerDto.Voornaam;
        deelnemer.Achternaam = deelnemerDto.Achternaam;
        deelnemer.Geboortedatum = deelnemerDto.Geboortedatum;
        deelnemer.Email = deelnemerDto.Email;
        deelnemer.Telefoonnummer = deelnemerDto.Telefoonnummer;
        deelnemer.DeelnameId = deelnemerDto.DeelnameId;
        _context.Deelnemers.Update(deelnemer);
        await _context.SaveChangesAsync();
        return deelnemer;
    }
    
    public async Task<bool> DeleteDeelnemer(int id)
    {
        Deelnemer? deelnemer = await _context.Deelnemers.FindAsync(id);
        if (deelnemer == null)
        {
            throw new InvalidOperationException("Deelnemer not found");
        }
        _context.Deelnemers.Remove(deelnemer);
        await _context.SaveChangesAsync();
        return true;
    }
}