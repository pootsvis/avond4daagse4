
namespace Avond4DaagseBackend.Services;

public class InschrijvingService(ApplicationDbContext context)
    : IInschrijvingService
{
    // Alle inschrijvingen ophalen, inclusief deelnemers.
    public async Task<List<Inschrijving>> GetAllInschrijvingen()
    {
        return await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .Include(i => i.Deelnemers)
                .ThenInclude(d => d.Persoon)
            .Include(i => i.Deelnemers)
                .ThenInclude(d => d.Deelname)
            .AsSplitQuery()
            .ToListAsync();
    }

    // Eén inschrijving ophalen.
    public async Task<Inschrijving> GetInschrijvingById(int id)
    {
        Inschrijving? inschrijving = await context.Inschrijvingen
            .Include(i => i.Contactpersoon)
            .Include(i => i.Deelnemers)
                .ThenInclude(d => d.Persoon)
            .Include(i => i.Deelnemers)
                .ThenInclude(d => d.Deelname)
            .AsSplitQuery()
            .FirstOrDefaultAsync(i => i.InschrijvingId == id);

        if (inschrijving == null)
        {
            throw new InvalidOperationException(
                "Inschrijving niet gevonden."
            );
        }

        return inschrijving;
    }

    // Nieuwe inschrijving met alle deelnemers opslaan.
    public async Task<Inschrijving> CreateInschrijving(
        CreateInschrijvingDto dto
    )
    {
        if (
            dto.Deelnemers == null ||
            dto.Deelnemers.Count == 0 ||
            dto.Deelnemers.Count != dto.AantalDeelnemers
        )
        {
            throw new InvalidOperationException(
                "Het aantal deelnemers komt niet overeen " +
                "met de opgegeven deelnemers."
            );
        }

        if (dto.AfstandKm != 5 && dto.AfstandKm != 10)
        {
            throw new InvalidOperationException(
                "Kies een afstand van 5 of 10 kilometer."
            );
        }

        bool evenementBeschikbaar = await context.Evenementen
            .AnyAsync(e =>
                e.EvenementId == dto.EvenementId &&
                e.InschrijvingGeopend
            );

        if (!evenementBeschikbaar)
        {
            throw new InvalidOperationException(
                "Het evenement bestaat niet of " +
                "de inschrijving is gesloten."
            );
        }

        Inschrijving inschrijving = new()
        {
            Inschrijfdatum = DateOnly.FromDateTime(
                DateTime.Today
            ),

            Status = "Ingediend",

            AantalDeelnemers = dto.AantalDeelnemers,

            AfstandKm = dto.AfstandKm,

            EvenementId = dto.EvenementId,

            Contactpersoon = new Contactpersoon
            {
                Email = dto.Contactpersoon?.Email ?? "",

                Telefoonnummer =
                    dto.Contactpersoon?.Telefoonnummer ?? ""
            },

            Deelnemers = dto.Deelnemers.Select(p =>
                new Deelnemer
                {
                    Persoon = new Persoon
                    {
                        Voornaam = p.Voornaam,
                        Achternaam = p.Achternaam
                    },

                    Deelname = new Deelname
                    {
                        School = p.SchoolOfGroep,

                        Groep = string.Empty,

                        Geboortedatum = p.Geboortedatum,

                        Geboortejaar = p.Geboortedatum.Year,

                        HoeveelheidKeer = p.HoeveelheidKeer,

                        // NIEUW:
                        // Begeleiderskeuze opslaan.
                        // Ja = true, Nee = false.
                        NeemtBegeleiderMee =
                            p.NeemtBegeleiderMee
                    }
                }
            ).ToList()
        };

        context.Inschrijvingen.Add(inschrijving);

        // Inschrijving, contactpersoon en deelnemers
        // worden samen opgeslagen in PostgreSQL.
        await context.SaveChangesAsync();

        return inschrijving;
    }

    // Bestaande inschrijving aanpassen.
    public async Task<Inschrijving> UpdateInschrijving(
        int id,
        UpdateInschrijvingDto dto
    )
    {
        Inschrijving inschrijving =
            await GetInschrijvingById(id);

        inschrijving.Status = dto.Status;

        inschrijving.AantalDeelnemers = dto.AantalDeelnemers;

        await context.SaveChangesAsync();

        return inschrijving;
    }

    // Inschrijving verwijderen.
    public async Task DeleteInschrijving(int id)
    {
        Inschrijving inschrijving =
            await GetInschrijvingById(id);

        context.Inschrijvingen.Remove(inschrijving);

        await context.SaveChangesAsync();
    }
}
