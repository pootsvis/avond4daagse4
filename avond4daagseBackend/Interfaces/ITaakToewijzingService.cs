namespace Avond4DaagseBackend.Interfaces;

public interface ITaakToewijzingService
{
    Task<List<Taaktoewijzing>> GetAllTaakToewijzingen();
    Task<Taaktoewijzing> GetTaakToewijzingById(int id);
    Task<Taaktoewijzing> CreateTaakToewijzing(CreateTaaktoewijzingDto taakToewijzingDto);
    Task<bool> DeleteTaakToewijzing(int id);
}
