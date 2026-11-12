namespace DefaultNamespace;

public interface ITransactieService
{
    Task<Transactie> GetTransactieById(int id);
    Task<List<Transactie>> GetAllTransacties();
    Task<Transactie> CreateTransactie(CreateTransactieDto transactieDto);
    Task<Transactie> UpdateTransactie(int id, UpdateTransactieDto transactieDto);
    Task<bool> DeleteTransactie(int id);
}