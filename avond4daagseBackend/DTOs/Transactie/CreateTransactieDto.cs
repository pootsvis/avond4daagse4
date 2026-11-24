using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateTransactieDto
{
    [Required]
    public string Type { get; set; } = string.Empty;

    public DateOnly Datum { get; set; }

    [Range(0.01, 1000000)]
    public decimal Bedrag { get; set; }

    public string Omschrijving { get; set; } = string.Empty;
    public string Categorie { get; set; } = string.Empty;
    public string Rekening { get; set; } = string.Empty;

    [Required]
    public string Betaalstatus { get; set; } = string.Empty;

    public string Factuur { get; set; } = string.Empty;

    public int InschrijvingId { get; set; }   // FK: bij welke inschrijving hoort de transactie

    // Optioneel: de service maakt de Betaling aan en vult TransactieId zelf in
    public BetalingDto? Betaling { get; set; }
}
