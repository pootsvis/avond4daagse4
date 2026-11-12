namespace avond4daagseBackend.Interfaces;

public interface IDeelnemerService
{
    Task<List<Deelnemer>> GetAllDeelnemers();
    Task<Deelnemer> GetDeelnemerById(int id);
    Task<Deelnemer> CreateDeelnemer(CreateDeelnemerDto deelnemerDto);
    Task<Deelnemer> UpdateDeelnemer(int id, UpdateDeelnemerDto deelnemerDto);
    Task<bool> DeleteDeelnemer(int id);
}