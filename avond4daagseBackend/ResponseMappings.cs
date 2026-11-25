
using Avond4DaagseBackend.Models;
using Route = Avond4DaagseBackend.Models.Route;

namespace Avond4DaagseBackend.DTOs;

public static class ResponseMappings
{
    // EVENEMENT
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

        SponsorIds = e.EvenementSponsors
            .Select(es => es.SponsorId)
            .ToList()
    };

    // ROUTE
    public static RouteResponse ToResponse(this Route r) => new()
{
    RouteId = r.RouteId,
    Naam = r.Naam,
    Afstand = r.Afstand,
    Starttijd = r.Starttijd,
    Controlepost = r.Controlepost,
    EvenementId = r.EvenementId,
    EvenementNaam = r.Evenement?.Naam ?? string.Empty,

    Wandelavond = r.Wandelavond,
    Startlocatie = r.Startlocatie,

    GpxPunten = string.IsNullOrWhiteSpace(r.GpxPuntenJson)
        ? Array.Empty<double[]>()
        : System.Text.Json.JsonSerializer
            .Deserialize<double[][]>(r.GpxPuntenJson)
            ?? Array.Empty<double[]>()
};

    // SPONSOR
    public static SponsorResponse ToResponse(this Sponsor s) => new()
    {
        SponsorId = s.SponsorId,
        Naam = s.Naam
    };

    // INSCHRIJVING
    public static InschrijvingResponse ToResponse(this Inschrijving i) => new()
    {
        InschrijvingId = i.InschrijvingId,
        Inschrijfdatum = i.Inschrijfdatum,
        Status = i.Status,
        AantalDeelnemers = i.AantalDeelnemers,
        EvenementId = i.EvenementId,
        AfstandKm = i.AfstandKm,

        Contactpersoon = i.Contactpersoon == null
            ? null
            : new ContactpersoonDto
            {
                Email = i.Contactpersoon.Email,
                Telefoonnummer = i.Contactpersoon.Telefoonnummer
            },

        Deelnemers = i.Deelnemers
            .Select(d => d.ToResponse())
            .ToList()
    };

    // TRANSACTIE
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

    // CONTACTVRAAG
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

    // GEBRUIKER
    public static GebruikerResponse ToResponse(this Gebruiker g) => new()
    {
        GebruikerId = g.GebruikerId,
        Naam = g.Naam,
        Email = g.Email
    };

    // VRIJWILLIGER
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

    // ROL
    public static RolResponse ToResponse(this Rol r) => new()
    {
        RolId = r.RolId,
        Naam = r.Naam,
        RechtIds = r.RolRechten
            .Select(rr => rr.RechtId)
            .ToList()
    };

    // RECHT
    public static RechtResponse ToResponse(this Recht r) => new()
    {
        RechtId = r.RechtId,
        Naam = r.Naam
    };

    // TAAKTOEWIJZING
    public static TaaktoewijzingResponse ToResponse(this Taaktoewijzing t) => new()
    {
        ToewijzingId = t.ToewijzingId,
        VrijwilligersId = t.VrijwilligersId,
        TaakId = t.TaakId
    };

    // DRAAIBOEK
    public static DraaiboektaakResponse ToResponse(this Draaiboektaak t) => new()
    {
        TaakId = t.TaakId,
        Titel = t.Titel,
        Beschrijving = t.Beschrijving,
        Datum = t.Datum,
        Categorie = t.Categorie,
        Status = t.Status,
        Verantwoordelijke = t.Verantwoordelijke,

        GebruikerIds = t.GebruikerDraaiboektaken
            .Select(gd => gd.GebruikerId)
            .ToList()
    };

    // DEELNEMER
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
                Geboortedatum = d.Deelname.Geboortedatum,
                HoeveelheidKeer = d.Deelname.HoeveelheidKeer,
                NeemtBegeleiderMee = d.Deelname.NeemtBegeleiderMee
            }
    };
}
