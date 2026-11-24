using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateDeelnemerDto
{
    // Velden van Persoon: de service maakt de Persoon aan
    [Required, StringLength(50)]
    public string Voornaam { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Achternaam { get; set; } = string.Empty;

    // De service maakt de Deelname aan en vult DeelnameId zelf in
    [Required]
    public DeelnameDto Deelname { get; set; } = null!;
}
