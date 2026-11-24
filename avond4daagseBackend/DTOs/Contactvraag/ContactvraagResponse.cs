namespace Avond4DaagseBackend.DTOs;

public class ContactvraagResponse
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
    public int? GebruikerId { get; set; }
}
