using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateVrijwilligerDto
{
    public string Beschikbaarheid { get; set; } = string.Empty;

    [Required]
    public string Telefoonnummer { get; set; } = string.Empty;

    public string Voorkeursrol { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inzetting { get; set; } = string.Empty;
}
