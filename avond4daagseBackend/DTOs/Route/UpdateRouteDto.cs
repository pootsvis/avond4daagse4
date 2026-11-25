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

    [Range(1, 4)]
    public int? Wandelavond { get; set; }

    [StringLength(250)]
    public string Startlocatie { get; set; } = string.Empty;

    public double[][]? GpxPunten { get; set; }
}