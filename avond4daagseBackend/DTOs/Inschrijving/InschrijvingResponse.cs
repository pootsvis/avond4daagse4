
namespace Avond4DaagseBackend.DTOs;

public class InschrijvingResponse
{
    public int InschrijvingId { get; set; }

    public DateOnly Inschrijfdatum { get; set; }

    public string Status { get; set; } = string.Empty;

    public int AantalDeelnemers { get; set; }

    public int EvenementId { get; set; }

    public ContactpersoonDto? Contactpersoon { get; set; }

    // NIEUW: gekozen wandelafstand.
    public int AfstandKm { get; set; }

    // NIEUW: deelnemers die bij deze inschrijving horen.
    public List<DeelnemerResponse> Deelnemers { get; set; } = new();
}
