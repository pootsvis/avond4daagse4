namespace Avond4DaagseBackend.Interfaces;

public interface IInschrijvingService
{
    Task<List<Inschrijving>> GetAllInschrijvingen();
    Task<Inschrijving> GetInschrijvingById(int id);
    Task<Inschrijving> CreateInschrijving(CreateInschrijvingDto inschrijvingDto);
    Task<Inschrijving> UpdateInschrijving(int id, UpdateInschrijvingDto inschrijvingDto);
    Task DeleteInschrijving(int id);
}