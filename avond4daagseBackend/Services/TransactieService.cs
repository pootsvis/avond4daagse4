namespace avond4daagseBackend.Services;

public class TransactieService(applicationDbContext context) : ITransactieService
{
    public async Task<List<Transactie>> GetAllTransacties()
    {
        return await context.Transacties.ToListAsync();
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
            Betaling = new Betaling
            {
                Bedrag = transactieDto.Betaling.Bedrag,
                Betaaldatum = transactieDto.Betaling.Betaaldatum,
                Status = transactieDto.Betaling.Status
            }
        };
        context.Transacties.Add(transactie);
        await context.SaveChangesAsync();
        return transactie;
    }
    
    public async Task<Transactie> UpdateTransactie(int id, UpdateTransactieDto transactieDto)
    {
        Transactie? transactie = await context.Transacties.FindAsync(id);
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
        context.Transacties.Update(transactie);
        await context.SaveChangesAsync();
        return transactie;
        
        //update betaling if provided
        if (transactieDto.Betaling != null)
        {
            if (transactie.Betaling == null)
            {
                transactie.Betaling = new Betaling();
                context.Betalingen.Add(transactie.Betaling);
            }
            transactie.Betaling.Bedrag = transactieDto.Betaling.Bedrag;
            transactie.Betaling.Betaaldatum = transactieDto.Betaling.Betaaldatum;
            transactie.Betaling.Status = transactieDto.Betaling.Status;
        }
    }
    
    public async Task DeleteTransactie(int id)
    {
        Transactie? transactie = await context.Transacties.FindAsync(id);
        if (transactie == null)
        {
            throw new InvalidOperationException("Transactie not found");
        }
        context.Transacties.Remove(transactie);
        await context.SaveChangesAsync();
    }
}
