namespace avond4daagseBackend.Interfaces;

public interface IDraaiboektaakService
{
    Task<List<Draaiboektaak>> GetAllDraaiboektaken();
    Task<Draaiboektaak> GetDraaiboektaakById(int id);
    Task<Draaiboektaak> CreateDraaiboektaak(CreateDraaiboektaakDto draaiboektaakDto);
    Task<Draaiboektaak> UpdateDraaiboektaak(int id, UpdateDraaiboektaakDto draaiboektaakDto);
    Task<bool> DeleteDraaiboektaak(int id);
}