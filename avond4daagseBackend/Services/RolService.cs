using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Interfaces;
using Avond4DaagseBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Services;

public class RolService(
    ApplicationDbContext context
) : IRolService
{
    public async Task<List<Rol>> GetAllRollen()
    {
        return await context.Rollen
            .Include(r => r.RolRechten)
            .ToListAsync();
    }

    public async Task<Rol> GetRolById(int id)
    {
        // FindAsync kan geen Include doen, daarom FirstOrDefaultAsync
        Rol? rol = await context.Rollen
            .Include(r => r.RolRechten)
            .FirstOrDefaultAsync(r => r.RolId == id);
        if (rol == null)
        {
            throw new InvalidOperationException("Rol not found");
        }
        return rol;
    }

    public async Task<Rol> AssignRol(int rolId, int gebruikerId)
    {
        Rol rol = await GetRolById(rolId);

        bool gebruikerBestaat = await context.Gebruikers.AnyAsync(g => g.GebruikerId == gebruikerId);
        if (!gebruikerBestaat)
        {
            throw new InvalidOperationException("Gebruiker not found");
        }

        // Heeft de gebruiker de rol al, dan is er niets te doen. De samengestelde sleutel
        // (GebruikerId, RolId) zou bij een tweede keer toevoegen een databasefout geven.
        bool alToegewezen = await context.GebruikerRollen
            .AnyAsync(gr => gr.GebruikerId == gebruikerId && gr.RolId == rolId);
        if (!alToegewezen)
        {
            // Eén rij in de koppeltabel GebruikerRol
            context.GebruikerRollen.Add(new GebruikerRol
            {
                GebruikerId = gebruikerId,
                RolId = rolId
            });
            await context.SaveChangesAsync();
        }

        return rol;
    }
}