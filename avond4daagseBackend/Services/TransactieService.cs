namespace Avond4DaagseBackend.Services;

public class TransactieService(ApplicationDbContext context) : ITransactieService
{
    public async Task<List<Transactie>> GetAllTransacties()
    {
        return await context.Transacties
            .Include(e => e.Betaling)
            .ToListAsync();
    }
    
    public async Task<Transactie> GetTransactieById(int id)
    {
        Transactie? transactie = await context.Transacties
            .Include(e => e.Betaling)
            .FirstOrDefaultAsync(e => e.TransactieId == id);
        if (transactie == null)
        {
            throw new InvalidOperationException("Transactie not found");
        }
        return transactie;
    }
    
    public async Task<Transactie> CreateTransactie(CreateTransactieDto transactieDto)
    {
        // De inschrijving waar de transactie bij hoort moet bestaan, anders krijg je een databasefout
        bool inschrijvingBestaat = await context.Inschrijvingen
            .AnyAsync(i => i.InschrijvingId == transactieDto.InschrijvingId);
        if (!inschrijvingBestaat)
        {
            throw new InvalidOperationException("Inschrijving not found");
        }
 
        Transactie transactie = new()
        {
            Type = transactieDto.Type,
            Datum = transactieDto.Datum,
            Bedrag = transactieDto.Bedrag,
            Omschrijving = transactieDto.Omschrijving,
            Categorie = transactieDto.Categorie,
            Rekening = transactieDto.Rekening,
            Betaalstatus = transactieDto.Betaalstatus,
            Factuur = transactieDto.Factuur,
            InschrijvingId = transactieDto.InschrijvingId
        };
 
        // Betaling is optioneel: alleen aanmaken als ze is meegestuurd
        if (transactieDto.Betaling != null)
        {
            transactie.Betaling = new Betaling
            {
                Bedrag = transactieDto.Betaling.Bedrag,
                Betaaldatum = transactieDto.Betaling.Betaaldatum,
                Status = transactieDto.Betaling.Status
            };
        }
 
        context.Transacties.Add(transactie);
        await context.SaveChangesAsync();
        return transactie;
    }
    
    public async Task<Transactie> UpdateTransactie(int id, UpdateTransactieDto transactieDto)
    {
        // Include Betaling, anders is transactie.Betaling altijd null en maak je steeds een nieuwe aan
        Transactie? transactie = await context.Transacties
            .Include(t => t.Betaling)
            .FirstOrDefaultAsync(t => t.TransactieId == id);
        if (transactie == null)
        {
            throw new InvalidOperationException("Transactie not found");
        }
 
        transactie.Type = transactieDto.Type;
        transactie.Datum = transactieDto.Datum;
        transactie.Bedrag = transactieDto.Bedrag;
        transactie.Omschrijving = transactieDto.Omschrijving;
        transactie.Categorie = transactieDto.Categorie;
        transactie.Rekening = transactieDto.Rekening;
        transactie.Betaalstatus = transactieDto.Betaalstatus;
        transactie.Factuur = transactieDto.Factuur;
 
        // Betaling alleen bijwerken als ze is meegestuurd (en aanmaken als er nog geen is)
        if (transactieDto.Betaling != null)
        {
            if (transactie.Betaling == null)
            {
                transactie.Betaling = new Betaling();
            }
            transactie.Betaling.Bedrag = transactieDto.Betaling.Bedrag;
            transactie.Betaling.Betaaldatum = transactieDto.Betaling.Betaaldatum;
            transactie.Betaling.Status = transactieDto.Betaling.Status;
        }
 
        // Het return stond bij jou boven het Betaling-blok, daardoor werd dat nooit uitgevoerd
        await context.SaveChangesAsync();
        return transactie;
    }
    
    public async Task<bool> DeleteTransactie(int id)
    {
        Transactie? transactie = await context.Transacties.FindAsync(id);
        if (transactie == null)
        {
            throw new InvalidOperationException("Transactie not found");
        }
        context.Transacties.Remove(transactie);
        await context.SaveChangesAsync();
        return true;
    }
}
