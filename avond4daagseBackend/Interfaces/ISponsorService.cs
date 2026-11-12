namespace avond4daagseBackend.Interfaces;

public interface ISponsorService
{
    Task<List<Sponsor>> GetAllSponsors();
    Task<Sponsor> GetSponsorById(int id);
    Task<Sponsor> CreateSponsor(CreateSponsorDto sponsorDto);
    Task<Sponsor> UpdateSponsor(int id, UpdateSponsorDto sponsorDto);
    Task<bool> DeleteSponsor(int id);
}