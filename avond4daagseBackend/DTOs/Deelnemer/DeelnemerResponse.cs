namespace Avond4DaagseBackend.DTOs;

public class DeelnemerResponse
{
    public int DeelnemerId { get; set; }
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public DeelnameDto Deelname { get; set; } = null!;
}
