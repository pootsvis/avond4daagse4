namespace Avond4DaagseBackend.DTOs;

public class VrijwilligerResponse
{
    public int VrijwilligersId { get; set; }
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string Beschikbaarheid { get; set; } = string.Empty;
    public string Telefoonnummer { get; set; } = string.Empty;
    public string Voorkeursrol { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inzetting { get; set; } = string.Empty;
}
