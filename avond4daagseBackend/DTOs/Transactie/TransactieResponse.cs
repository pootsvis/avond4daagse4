namespace Avond4DaagseBackend.DTOs;

public class TransactieResponse
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
    public BetalingDto? Betaling { get; set; }
}
