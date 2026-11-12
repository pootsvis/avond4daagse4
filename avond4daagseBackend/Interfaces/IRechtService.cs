namespace avond4daagseBackend.Interfaces;

public interface IRechtService
{
    Task<List<Recht>> GetAllRechten();
    Task<Recht> GetRechtById(int id);
    Task<Recht> CreateRecht(CreateRechtDto rechtDto);
    Task<Recht> UpdateRecht(int id, UpdateRechtDto rechtDto);
}