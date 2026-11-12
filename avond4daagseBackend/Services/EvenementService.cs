using Avond4Daagse.Data;
using Avond4Daagse.DTOs;
using Avond4Daagse.Interfaces;
using Avond4Daagse.Models;
using Microsoft.EntityFrameworkCore;

namespace Avond4Daagse.Services;

public class EvenementService(
    ApplicationDbContext context
) : IEvenementService
{
    public async Task<List<Evenement>> GetAllEvenementen()
    {
        return await context.Evenementen
            .Include(e => e.InzetSchema)
            .Include(e => e.PraktischeInformatie)
            .Include(e => e.EvenementSponsors)
            .ToListAsync();
    }

    public async Task<Evenement> GetEvenementById(int id)
    {
        // FindAsync kan geen Include doen, daarom FirstOrDefaultAsync
        Evenement? evenement = await context.Evenementen
            .Include(e => e.InzetSchema)
            .Include(e => e.PraktischeInformatie)
            .Include(e => e.EvenementSponsors)
            .FirstOrDefaultAsync(e => e.EvenementId == id);
        if (evenement == null)
        {
            throw new InvalidOperationException("Evenement not found");
        }
        return evenement;
    }

    public async Task<Evenement> CreateEvenement(CreateEvenementDto evenementDto)
    {
        List<int> sponsorIds = evenementDto.SponsorIds.Distinct().ToList();
        await CheckSponsorsExist(sponsorIds);

        // InzetSchemaId en PraktischeInformatieId zet je niet zelf:
        // EF Core maakt de gekoppelde records aan en vult de foreign keys in bij SaveChanges
        Evenement evenement = new()
        {
            Naam = evenementDto.Naam,
            Beschrijving = evenementDto.Beschrijving,
            Datum = evenementDto.Datum,
            Locatie = evenementDto.Locatie,
            InschrijvingGeopend = evenementDto.InschrijvingGeopend,
            Publicatiestatus = evenementDto.Publicatiestatus,
            InzetSchema = new InzetSchema
            {
                Tijd = evenementDto.InzetSchema.Tijd,
                Datum = evenementDto.InzetSchema.Datum,
                Taak = evenementDto.InzetSchema.Taak
            },
            PraktischeInformatie = new PraktischeInformatie
            {
                Bereikbaarheid = evenementDto.PraktischeInformatie.Bereikbaarheid,
                Deelnemersinformatie = evenementDto.PraktischeInformatie.Deelnemersinformatie
            },
            EvenementSponsors = sponsorIds
                .Select(sponsorId => new EvenementSponsor { SponsorId = sponsorId })
                .ToList()
        };
        context.Evenementen.Add(evenement);
        await context.SaveChangesAsync();
        return evenement;
    }

    public async Task<Evenement> UpdateEvenement(int id, UpdateEvenementDto evenementDto)
    {
        Evenement evenement = await GetEvenementById(id);

        List<int> sponsorIds = evenementDto.SponsorIds.Distinct().ToList();
        await CheckSponsorsExist(sponsorIds);

        evenement.Naam = evenementDto.Naam;
        evenement.Beschrijving = evenementDto.Beschrijving;
        evenement.Datum = evenementDto.Datum;
        evenement.Locatie = evenementDto.Locatie;
        evenement.InschrijvingGeopend = evenementDto.InschrijvingGeopend;
        evenement.Publicatiestatus = evenementDto.Publicatiestatus;

        evenement.InzetSchema.Tijd = evenementDto.InzetSchema.Tijd;
        evenement.InzetSchema.Datum = evenementDto.InzetSchema.Datum;
        evenement.InzetSchema.Taak = evenementDto.InzetSchema.Taak;

        evenement.PraktischeInformatie.Bereikbaarheid = evenementDto.PraktischeInformatie.Bereikbaarheid;
        evenement.PraktischeInformatie.Deelnemersinformatie = evenementDto.PraktischeInformatie.Deelnemersinformatie;

        // Koppeltabel bijwerken: alleen verwijderen wat weg moet, alleen toevoegen wat nieuw is
        HashSet<int> huidigeIds = evenement.EvenementSponsors.Select(es => es.SponsorId).ToHashSet();
        HashSet<int> nieuweIds = sponsorIds.ToHashSet();

        foreach (EvenementSponsor teVerwijderen in evenement.EvenementSponsors
                     .Where(es => !nieuweIds.Contains(es.SponsorId))
                     .ToList())
        {
            context.EvenementSponsors.Remove(teVerwijderen);
        }

        foreach (int sponsorId in nieuweIds.Where(sid => !huidigeIds.Contains(sid)))
        {
            evenement.EvenementSponsors.Add(new EvenementSponsor { SponsorId = sponsorId });
        }

        await context.SaveChangesAsync();
        return evenement;
    }

    public async Task<bool> DeleteEvenement(int id)
    {
        Evenement evenement = await GetEvenementById(id);

        // Routes, inschrijvingen en koppelrecords verdwijnen via cascade.
        // InzetSchema en PraktischeInformatie niet (de FK staat bij Evenement), die verwijder je zelf
        context.Evenementen.Remove(evenement);
        context.InzetSchemas.Remove(evenement.InzetSchema);
        context.PraktischeInformaties.Remove(evenement.PraktischeInformatie);

        await context.SaveChangesAsync();
        return true;
    }

    private async Task CheckSponsorsExist(List<int> sponsorIds)
    {
        if (sponsorIds.Count == 0)
        {
            return;
        }
        int aantalGevonden = await context.Sponsors.CountAsync(s => sponsorIds.Contains(s.SponsorId));
        if (aantalGevonden != sponsorIds.Count)
        {
            throw new InvalidOperationException("Sponsor not found");
        }
    }
}