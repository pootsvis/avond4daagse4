using Avond4Daagse.DTOs;
using Avond4Daagse.Models;

namespace Avond4Daagse.Interfaces;

public interface IEvenementService
{
    Task<List<Evenement>> GetAllEvenementen();
    Task<Evenement> GetEvenementById(int id);
    Task<Evenement> CreateEvenement(CreateEvenementDto evenementDto);
    Task<Evenement> UpdateEvenement(int id, UpdateEvenementDto evenementDto);
    Task<bool> DeleteEvenement(int id);
}