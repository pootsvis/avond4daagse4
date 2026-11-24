using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateVrijwilligerDto
{
    // Velden van Persoon: de service maakt de Persoon aan
    [Required, StringLength(50)]
    public string Voornaam { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Achternaam { get; set; } = string.Empty;

    public string Beschikbaarheid { get; set; } = string.Empty;

    [Required]
    public string Telefoonnummer { get; set; } = string.Empty;

    public string Voorkeursrol { get; set; } = string.Empty;
    // Geen Status en Inzetting: die beheert de organisatie
}
