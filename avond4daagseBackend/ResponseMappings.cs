using Avond4DaagseBackend.Models;
using Route = Avond4DaagseBackend.Models.Route; // voorkomt verwarring met Microsoft.AspNetCore.Routing.Route

namespace Avond4DaagseBackend.DTOs;

// Eén plek voor alle mapping van model naar response. Gebruik in een controller:
//   Ok(evenement.ToResponse())
//   Ok(evenementen.Select(e => e.ToResponse()).ToList())
public static class ResponseMappings
{
    public static EvenementResponse ToResponse(this Evenement e) => new()
    {
        EvenementId = e.EvenementId,
        Naam = e.Naam,
        Beschrijving = e.Beschrijving,
        Datum = e.Datum,
        Locatie = e.Locatie,
        InschrijvingGeopend = e.InschrijvingGeopend,
        Publicatiestatus = e.Publicatiestatus,
        InzetSchema = e.InzetSchema == null
            ? new InzetSchemaDto()
            : new InzetSchemaDto
            {
                Tijd = e.InzetSchema.Tijd,
                Datum = e.InzetSchema.Datum,
                Taak = e.InzetSchema.Taak
            },
        PraktischeInformatie = e.PraktischeInformatie == null
            ? new PraktischeInformatieDto()
            : new PraktischeInformatieDto
            {
                Bereikbaarheid = e.PraktischeInformatie.Bereikbaarheid,
                Deelnemersinformatie = e.PraktischeInformatie.Deelnemersinformatie
            },
        SponsorIds = e.EvenementSponsors.Select(es => es.SponsorId).ToList()
    };

    public static RouteResponse ToResponse(this Route r) => new()
    {
        RouteId = r.RouteId,
        Naam = r.Naam,
        Afstand = r.Afstand,
        Starttijd = r.Starttijd,
        Controlepost = r.Controlepost,
        EvenementId = r.EvenementId,
        EvenementNaam = r.Evenement?.Naam ?? string.Empty
    };

    public static SponsorResponse ToResponse(this Sponsor s) => new()
    {
        SponsorId = s.SponsorId,
        Naam = s.Naam
    };

    public static InschrijvingResponse ToResponse(this Inschrijving i) => new()
    {
        InschrijvingId = i.InschrijvingId,
        Inschrijfdatum = i.Inschrijfdatum,
        Status = i.Status,
        AantalDeelnemers = i.AantalDeelnemers,
        EvenementId = i.EvenementId,
        Contactpersoon = i.Contactpersoon == null
            ? null
            : new ContactpersoonDto
            {
                Email = i.Contactpersoon.Email,
                Telefoonnummer = i.Contactpersoon.Telefoonnummer
            }
    };

    public static TransactieResponse ToResponse(this Transactie t) => new()
    {
        TransactieId = t.TransactieId,
        Type = t.Type,
        Datum = t.Datum,
        Bedrag = t.Bedrag,
        Omschrijving = t.Omschrijving,
        Categorie = t.Categorie,
        Rekening = t.Rekening,
        Betaalstatus = t.Betaalstatus,
        Factuur = t.Factuur,
        InschrijvingId = t.InschrijvingId,
        Betaling = t.Betaling == null
            ? null
            : new BetalingDto
            {
                Bedrag = t.Betaling.Bedrag,
                Betaaldatum = t.Betaling.Betaaldatum,
                Status = t.Betaling.Status
            }
    };

    public static ContactvraagResponse ToResponse(this Contactvraag c) => new()
    {
        ContactvraagId = c.ContactvraagId,
        Voornaam = c.Voornaam,
        Achternaam = c.Achternaam,
        Email = c.Email,
        Onderwerp = c.Onderwerp,
        Bericht = c.Bericht,
        Datum = c.Datum,
        Status = c.Status,
        Conceptreactie = c.Conceptreactie,
        GebruikerId = c.GebruikerId
    };

    // Bewust zonder wachtwoord (hash)
    public static GebruikerResponse ToResponse(this Gebruiker g) => new()
    {
        GebruikerId = g.GebruikerId,
        Naam = g.Naam,
        Email = g.Email
    };

    public static VrijwilligerResponse ToResponse(this Vrijwilliger v) => new()
    {
        VrijwilligersId = v.VrijwilligersId,
        Voornaam = v.Persoon?.Voornaam ?? string.Empty,
        Achternaam = v.Persoon?.Achternaam ?? string.Empty,
        Beschikbaarheid = v.Beschikbaarheid,
        Telefoonnummer = v.Telefoonnummer,
        Voorkeursrol = v.Voorkeursrol,
        Status = v.Status,
        Inzetting = v.Inzetting
    };

    public static RolResponse ToResponse(this Rol r) => new()
    {
        RolId = r.RolId,
        Naam = r.Naam,
        RechtIds = r.RolRechten.Select(rr => rr.RechtId).ToList()
    };

    public static RechtResponse ToResponse(this Recht r) => new()
    {
        RechtId = r.RechtId,
        Naam = r.Naam
    };

    public static TaaktoewijzingResponse ToResponse(this Taaktoewijzing t) => new()
    {
        ToewijzingId = t.ToewijzingId,
        VrijwilligersId = t.VrijwilligersId,
        TaakId = t.TaakId
    };

    public static DraaiboektaakResponse ToResponse(this Draaiboektaak t) => new()
    {
        TaakId = t.TaakId,
        Titel = t.Titel,
        Beschrijving = t.Beschrijving,
        Datum = t.Datum,
        Categorie = t.Categorie,
        Status = t.Status,
        Verantwoordelijke = t.Verantwoordelijke,
        GebruikerIds = t.GebruikerDraaiboektaken.Select(gd => gd.GebruikerId).ToList()
    };

    public static DeelnemerResponse ToResponse(this Deelnemer d) => new()
    {
        DeelnemerId = d.DeelnemerId,
        Voornaam = d.Persoon?.Voornaam ?? string.Empty,
        Achternaam = d.Persoon?.Achternaam ?? string.Empty,
        Deelname = d.Deelname == null
            ? new DeelnameDto()
            : new DeelnameDto
            {
                School = d.Deelname.School,
                Groep = d.Deelname.Groep,
                Geboortejaar = d.Deelname.Geboortejaar,
                HoeveelheidKeer = d.Deelname.HoeveelheidKeer,
                NeemtBegeleiderMee = d.Deelname.NeemtBegeleiderMee
            }
    };
}