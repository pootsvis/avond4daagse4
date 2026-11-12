namespace avond4daagseBackend.Services;

public class DraaiboektaakService(applicationDbContext context, IMapper mapper) : IDraaiboektaakService
{
    public async Task<List<Draaiboektaak>> GetAllDraaiboektaken()
    {
        return await _context.Draaiboektaken.ToListAsync();
            .include(d => d.GebruikerDraaiboektaak)
            .toListAsync();
    }
    
    public async Task<Draaiboektaak> GetDraaiboektaakById(int id)
    {
        Draaiboektaak? draaiboektaak = await _context.Draaiboektaken.FindAsync(id);
            .include(d => d.GebruikerDraaiboektaak)
            .FirstOrDefaultAsync(e => e.DraaiboektaakId == id);
        if (draaiboektaak == null)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }
        return draaiboektaak;
    }
    
    public async Task<Draaiboektaak> CreateDraaiboektaak(CreateDraaiboektaakDto draaiboektaakDto)
    {
        Draaiboektaak draaiboektaak = _mapper.Map<Draaiboektaak>(draaiboektaakDto);
        _context.Draaiboektaken.Add(draaiboektaak);
        await _context.SaveChangesAsync();
        return draaiboektaak;
    }
    
    public async Task<Draaiboektaak> UpdateDraaiboektaak(int id, UpdateDraaiboektaakDto draaiboektaakDto)
    {
        Draaiboektaak? draaiboektaak = await _context.Draaiboektaken.FindAsync(id);
        if (draaiboektaak == null)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }
        _mapper.Map(draaiboektaakDto, draaiboektaak);
        _context.Draaiboektaken.Update(draaiboektaak);
        await _context.SaveChangesAsync();
        return draaiboektaak;
    }
    
    public async Task<bool> DeleteDraaiboektaak(int id)
    {
        Draaiboektaak? draaiboektaak = await _context.Draaiboektaken.FindAsync(id);
        if (draaiboektaak == null)
        {
            throw new InvalidOperationException("Draaiboektaak not found");
        }
        _context.Draaiboektaken.Remove(draaiboektaak);
        await _context.SaveChangesAsync();
        return true;
    }
}