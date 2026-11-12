namespace DefaultNamespace;

public class SponsorService (applicationDbContext context) : ISponsorService
{
    public async Task<List<Sponsor>> GetAllSponsors()
    {
        return await context.Sponsors.ToListAsync();
    }
    
    public async Task<Sponsor> GetSponsorById(int id)
    {
        Sponsor? sponsor = await context.Sponsors.FindAsync(id);
        if (sponsor == null)
        {
            throw new InvalidOperationException("Sponsor not found");
        }
        return sponsor;
    }
    
    public async Task<Sponsor> CreateSponsor(CreateSponsorDto sponsorDto)
    {
        Sponsor sponsor = new()
        {
            Naam = sponsorDto.Naam,
        };
        context.Sponsors.Add(sponsor);
        await context.SaveChangesAsync();
        return sponsor;
    }
    
    public async Task<Sponsor> UpdateSponsor(int id, UpdateSponsorDto sponsorDto)
    {
        Sponsor? sponsor = await context.Sponsors.FindAsync(id);
        if (sponsor == null)
        {
            throw new InvalidOperationException("Sponsor not found");
        }
        sponsor.Naam = sponsorDto.Naam;
        context.Sponsors.Update(sponsor);
        await context.SaveChangesAsync();
        return sponsor;
    }
    
    public async Task<bool> DeleteSponsor(int id)
    {
        Sponsor? sponsor = await context.Sponsors.FindAsync(id);
        if (sponsor == null)
        {
            throw new InvalidOperationException("Sponsor not found");
        }
        context.Sponsors.Remove(sponsor);
        await context.SaveChangesAsync();
        return true;
    }
}