using Avond4DaagseBackend.DTOs;
using Avond4DaagseBackend.Models;

namespace Avond4DaagseBackend.Interfaces;

public interface ITaakToewijzingService
{
    Task<List<Taaktoewijzing>> GetAllTaaktoewijzingen();
    Task<Taaktoewijzing> GetTaaktoewijzingById(int id);
    Task<Taaktoewijzing> CreateTaaktoewijzing(CreateTaaktoewijzingDto taaktoewijzingDto);
    Task DeleteTaaktoewijzing(int id);
}