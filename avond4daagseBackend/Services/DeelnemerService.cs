namespace Avond4DaagseBackend.Services;

public class DeelnemerService(ApplicationDbContext context) : IDeelnemerService
{
    public async Task<List<Deelnemer>> GetAllDeelnemers()
    {
        return await context.Deelnemers
            .Include(d => d.Persoon)
            .Include(d => d.Deelname)
            .ToListAsync();
    }
    
    public async Task<Deelnemer> GetDeelnemerById(int id)
    {
        Deelnemer? deelnemer = await context.Deelnemers
            .Include(d => d.Persoon)
            .Include(d => d.Deelname)
            .FirstOrDefaultAsync(d => d.DeelnemerId == id);
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
            Persoon = new Persoon
            {
                Voornaam = deelnemerDto.Voornaam,
                Achternaam = deelnemerDto.Achternaam
            },
            Deelname = new Deelname
            {
                School = deelnemerDto.Deelname.School,
                Groep = deelnemerDto.Deelname.Groep,
                Geboortejaar = deelnemerDto.Deelname.Geboortejaar,
                HoeveelheidKeer = deelnemerDto.Deelname.HoeveelheidKeer,
                NeemtBegeleiderMee = deelnemerDto.Deelname.NeemtBegeleiderMee
            }
        };
        context.Deelnemers.Add(deelnemer);
        await context.SaveChangesAsync();
        return deelnemer;
    }
    
    public async Task<Deelnemer> UpdateDeelnemer(int id, UpdateDeelnemerDto deelnemerDto)
    {
        Deelnemer? deelnemer = await context.Deelnemers
            .Include(d => d.Persoon)
            .Include(d => d.Deelname)
            .FirstOrDefaultAsync(d => d.DeelnemerId == id);
        if (deelnemer == null)
        {
            throw new InvalidOperationException("Deelnemer not found");
        }
        deelnemer.Persoon.Voornaam = deelnemerDto.Voornaam;
        deelnemer.Persoon.Achternaam = deelnemerDto.Achternaam;
        deelnemer.Deelname.School = deelnemerDto.Deelname.School;
        deelnemer.Deelname.Groep = deelnemerDto.Deelname.Groep;
        deelnemer.Deelname.Geboortejaar = deelnemerDto.Deelname.Geboortejaar;
        deelnemer.Deelname.HoeveelheidKeer = deelnemerDto.Deelname.HoeveelheidKeer;
        deelnemer.Deelname.NeemtBegeleiderMee = deelnemerDto.Deelname.NeemtBegeleiderMee;
        await context.SaveChangesAsync();
        return deelnemer;
    }
    
    public async Task<bool> DeleteDeelnemer(int id)
    {
        Deelnemer? deelnemer = await context.Deelnemers.FindAsync(id);
        if (deelnemer == null)
        {
            throw new InvalidOperationException("Deelnemer not found");
        }
        context.Deelnemers.Remove(deelnemer);
        await context.SaveChangesAsync();
        return true;
    }
}