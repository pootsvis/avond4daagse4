namespace DefaultNamespace;

public interface IGebruikerService
{
    Task<List<Gebruiker>> GetAllGebruikers();
    Task<Gebruiker> GetGebruikerById(int id);
    Task<Gebruiker> CreateGebruiker(CreateGebruikerDto gebruikerDto);
    Task<Gebruiker> UpdateGebruiker(int id, UpdateGebruikerDto gebruikerDto);
    Task<bool> DeleteGebruiker(int id);
}