namespace avond4daagseBackend.Interfaces;

public interface IInschrijvingService
{
    Task<List<Inschrijving>> GetAllInschrijvingen();
    Task<Inschrijving> GetInschijvingById(int id);
    Task<Inschrijving> CreateInschrijving(CreateInschrijvingDto inschijvingDto);
    Task<Inschrijving> UpdateInschrijving(int id, UpdateInschrijvingDto inschrijvingDto);
    Task DeleteInschrijving(int id);
}