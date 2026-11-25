
using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateInschrijvingDto
{
    [Required]
    public int EvenementId { get; set; }

    [Range(1, 8)]
    public int AantalDeelnemers { get; set; }

    [Required]
    public ContactpersoonDto? Contactpersoon { get; set; }

    // Gekozen wandelafstand: 5 of 10 kilometer.
    [Range(5, 10)]
    public int AfstandKm { get; set; }

    // Alle deelnemers van deze inschrijving.
    [Required]
    [MinLength(1)]
    [MaxLength(8)]
    public List<InschrijvingDeelnemerDto> Deelnemers { get; set; } = new();
}
