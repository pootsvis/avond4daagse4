namespace DefaultNamespace;

public interface IContactvraagService
{
    Task<List<Contactvraag>> GetAllContactvragen();
    Task<Contactvraag> GetContactvraagById(int id);
    Task<Contactvraag> CreateContactvraag(CreateContactvraagDto contactvraagDto);
    Task<Contactvraag> UpdateContactvraag(int id, UpdateContactvraagDto contactvraagDto);
    Task<bool> DeleteContactvraag(int id);
}