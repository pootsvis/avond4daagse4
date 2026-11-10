using System.ComponentModel.DataAnnotations;
namespace Avond4DaagseBackend.DTOs;

public class CreateInschrijvingDto
{
    public int EvenementId { get; set; }

    [Range(1, 1000)]
    public int AantalDeelnemers { get; set; }

    // De service maakt de Contactpersoon aan en vult ContactpersoonId zelf in
    [Required]
    public ContactpersoonDto Contactpersoon { get; set; } = null!;

    // Geen Inschrijfdatum en Status: die zet de service (vandaag, "Ingediend")
}
