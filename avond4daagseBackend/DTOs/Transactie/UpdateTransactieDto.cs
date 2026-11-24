using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateTransactieDto
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
    public BetalingDto? Betaling { get; set; }
    // Geen InschrijvingId: een transactie verhuist niet naar een andere inschrijving
}
