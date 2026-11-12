namespace avond4daagseBackend.Interfaces;

public interface IVrijwilligerService
{
    Task<List<Vrijwilliger>> GetAllVrijwilligers();
    Task<Vrijwilliger> GetVrijwilligerById(int id);
    Task<Vrijwilliger> CreateVrijwilliger(CreateVrijwilligerDto vrijwilligerDto);
    Task<Vrijwilliger> UpdateVrijwilliger(int id, UpdateVrijwilligerDto vrijwilligerDto);
    Task<bool> DeleteVrijwilliger(int id);
}