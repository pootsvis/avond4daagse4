
using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class InschrijvingDeelnemerDto
{
    [Required]
    [StringLength(80)]
    public string Voornaam { get; set; } = string.Empty;

    [Required]
    [StringLength(80)]
    public string Achternaam { get; set; } = string.Empty;

    [StringLength(100)]
    public string SchoolOfGroep { get; set; } = string.Empty;

    public DateOnly Geboortedatum { get; set; }

    [Range(1, 50)]
    public int HoeveelheidKeer { get; set; } = 1;

    // Geeft aan of deze deelnemer
    // met een begeleider meeloopt.
    public bool NeemtBegeleiderMee { get; set; }
}
