using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateDeelnemerDto
{
    [Required, StringLength(50)]
    public string Voornaam { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Achternaam { get; set; } = string.Empty;

    [Required]
    public DeelnameDto Deelname { get; set; } = null!;
}
