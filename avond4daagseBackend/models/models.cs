namespace Avond4DaagseBackend.Models; 

// ---------- Evenement en bijbehorende gegevens ----------

public class Evenement
{
    public int EvenementId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Beschrijving { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public string Locatie { get; set; } = string.Empty;
    public bool InschrijvingGeopend { get; set; }
    public string Publicatiestatus { get; set; } = string.Empty;

    public int InzetSchemaId { get; set; }
    public InzetSchema InzetSchema { get; set; } = null!;

    public int PraktischeInformatieId { get; set; }
    public PraktischeInformatie PraktischeInformatie { get; set; } = null!;

    public ICollection<Route> Routes { get; set; } = new List<Route>();
    public ICollection<EvenementSponsor> EvenementSponsors { get; set; } = new List<EvenementSponsor>();
    public ICollection<Inschrijving> Inschrijvingen { get; set; } = new List<Inschrijving>();
}

public class InzetSchema
{
    public int InzetSchemaId { get; set; }
    public TimeOnly Tijd { get; set; }
    public DateOnly Datum { get; set; }
    public string Taak { get; set; } = string.Empty;

    public Evenement? Evenement { get; set; }
}

public class PraktischeInformatie
{
    public int PraktischeInformatieId { get; set; }
    public string Bereikbaarheid { get; set; } = string.Empty;
    public string Deelnemersinformatie { get; set; } = string.Empty;

    public Evenement? Evenement { get; set; }
}

public class Route
{
    public int RouteId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public double Afstand { get; set; }
    public TimeOnly Starttijd { get; set; }
    public string Controlepost { get; set; } = string.Empty;

    public int EvenementId { get; set; }
    public Evenement Evenement { get; set; } = null!;
}

public class Sponsor
{
    public int SponsorId { get; set; }
    public string Naam { get; set; } = string.Empty;

    public ICollection<EvenementSponsor> EvenementSponsors { get; set; } = new List<EvenementSponsor>();
}

public class EvenementSponsor
{
    public int EvenementId { get; set; }
    public Evenement Evenement { get; set; } = null!;

    public int SponsorId { get; set; }
    public Sponsor Sponsor { get; set; } = null!;
}

// ---------- Personen ----------

public class Persoon
{
    public int PersoonId { get; set; }
    public string Achternaam { get; set; } = string.Empty;
    public string Voornaam { get; set; } = string.Empty;

    public Deelnemer? Deelnemer { get; set; }
    public Vrijwilliger? Vrijwilliger { get; set; }
    public ICollection<Contactvraag> Contactvragen { get; set; } = new List<Contactvraag>();
}

public class Deelnemer
{
    public int DeelnemerId { get; set; }   // PK en tegelijk FK naar Persoon
    public Persoon Persoon { get; set; } = null!;

    public int DeelnameId { get; set; }
    public Deelname Deelname { get; set; } = null!;
}

public class Deelname
{
    public int DeelnameId { get; set; }
    public string School { get; set; } = string.Empty;
    public string Groep { get; set; } = string.Empty;
    public int Geboortejaar { get; set; }
    public int HoeveelheidKeer { get; set; }
    public bool NeemtBegeleiderMee { get; set; }

    public ICollection<Deelnemer> Deelnemers { get; set; } = new List<Deelnemer>();
}

public class Vrijwilliger
{
    public int VrijwilligersId { get; set; }   // PK en tegelijk FK naar Persoon
    public Persoon Persoon { get; set; } = null!;

    public string Beschikbaarheid { get; set; } = string.Empty;
    public string Telefoonnummer { get; set; } = string.Empty;
    public string Voorkeursrol { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inzetting { get; set; } = string.Empty;

    public ICollection<Taaktoewijzing> Taaktoewijzingen { get; set; } = new List<Taaktoewijzing>();
}

// ---------- Inschrijving en betaling ----------

public class Contactpersoon
{
    public int ContactpersoonId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Telefoonnummer { get; set; } = string.Empty;

    public ICollection<Inschrijving> Inschrijvingen { get; set; } = new List<Inschrijving>();
}

public class Inschrijving
{
    public int InschrijvingId { get; set; }
    public DateOnly Inschrijfdatum { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AantalDeelnemers { get; set; }

    public int EvenementId { get; set; }
    public Evenement Evenement { get; set; } = null!;

    public int ContactpersoonId { get; set; }
    public Contactpersoon Contactpersoon { get; set; } = null!;

    public ICollection<Transactie> Transacties { get; set; } = new List<Transactie>();
}

public class Transactie
{
    public int TransactieId { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public decimal Bedrag { get; set; }
    public string Omschrijving { get; set; } = string.Empty;
    public string Categorie { get; set; } = string.Empty;
    public string Rekening { get; set; } = string.Empty;
    public string Betaalstatus { get; set; } = string.Empty;
    public string Factuur { get; set; } = string.Empty;

    public int InschrijvingId { get; set; }
    public Inschrijving Inschrijving { get; set; } = null!;

    public Betaling? Betaling { get; set; }
}

public class Betaling
{
    public int BetalingId { get; set; }
    public decimal Bedrag { get; set; }
    public DateOnly Betaaldatum { get; set; }
    public string Status { get; set; } = string.Empty;

    public int TransactieId { get; set; }
    public Transactie Transactie { get; set; } = null!;
}

// ---------- Gebruikers, rollen en rechten ----------

public class Gebruiker
{
    public int GebruikerId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Wachtwoord { get; set; } = string.Empty; // sla hier een hash op, nooit platte tekst

    public ICollection<GebruikerRol> GebruikerRollen { get; set; } = new List<GebruikerRol>();
    public ICollection<GebruikerDraaiboektaak> GebruikerDraaiboektaken { get; set; } = new List<GebruikerDraaiboektaak>();
    public ICollection<Contactvraag> Contactvragen { get; set; } = new List<Contactvraag>();
}

public class Rol
{
    public int RolId { get; set; }
    public string Naam { get; set; } = string.Empty;

    public ICollection<GebruikerRol> GebruikerRollen { get; set; } = new List<GebruikerRol>();
    public ICollection<RolRecht> RolRechten { get; set; } = new List<RolRecht>();
}

public class Recht
{
    public int RechtId { get; set; }
    public string Naam { get; set; } = string.Empty;

    public ICollection<RolRecht> RolRechten { get; set; } = new List<RolRecht>();
}

public class GebruikerRol
{
    public int GebruikerId { get; set; }
    public Gebruiker Gebruiker { get; set; } = null!;

    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;
}

public class RolRecht
{
    public int RolId { get; set; }
    public Rol Rol { get; set; } = null!;

    public int RechtId { get; set; }
    public Recht Recht { get; set; } = null!;
}

// ---------- Contactvragen ----------

public class Contactvraag
{
    public int ContactvraagId { get; set; }
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Onderwerp { get; set; } = string.Empty;
    public string Bericht { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Conceptreactie { get; set; }

    public int PersoonId { get; set; }
    public Persoon Persoon { get; set; } = null!;

    public int? GebruikerId { get; set; }   // optioneel (NULL toegestaan)
    public Gebruiker? Gebruiker { get; set; }
}

// ---------- Draaiboek ----------

public class Draaiboektaak
{
    public int TaakId { get; set; }
    public string Titel { get; set; } = string.Empty;
    public string Beschrijving { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public string Categorie { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Verantwoordelijke { get; set; } = string.Empty;

    public ICollection<GebruikerDraaiboektaak> GebruikerDraaiboektaken { get; set; } = new List<GebruikerDraaiboektaak>();
    public ICollection<Taaktoewijzing> Taaktoewijzingen { get; set; } = new List<Taaktoewijzing>();
}

public class GebruikerDraaiboektaak
{
    public int GebruikerId { get; set; }
    public Gebruiker Gebruiker { get; set; } = null!;

    public int TaakId { get; set; }
    public Draaiboektaak Draaiboektaak { get; set; } = null!;
}

public class Taaktoewijzing
{
    public int ToewijzingId { get; set; }

    public int VrijwilligersId { get; set; }
    public Vrijwilliger Vrijwilliger { get; set; } = null!;

    public int TaakId { get; set; }
    public Draaiboektaak Draaiboektaak { get; set; } = null!;
}