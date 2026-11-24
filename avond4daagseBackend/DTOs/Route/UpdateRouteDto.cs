using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateRouteDto
{
    [Required, StringLength(100)]
    public string Naam { get; set; } = string.Empty;

    [Range(0.1, 500)]
    public double Afstand { get; set; }

    public TimeOnly Starttijd { get; set; }
    public string Controlepost { get; set; } = string.Empty;
    // Geen EvenementId: een route verhuist niet naar een ander evenement
}
