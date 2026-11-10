namespace Avond4DaagseBackend.DTOs;

public class RouteResponse
{
    public int RouteId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public double Afstand { get; set; }
    public TimeOnly Starttijd { get; set; }
    public string Controlepost { get; set; } = string.Empty;
    public int EvenementId { get; set; }
    public string EvenementNaam { get; set; } = string.Empty;
}
