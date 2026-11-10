using System.ComponentModel.DataAnnotations;
namespace Avond4DaagseBackend.DTOs;

public class CreateEvenementDto
{
    [Required, StringLength(100)]
    public string Naam { get; set; } = string.Empty;

    public string Beschrijving { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }

    [Required]
    public string Locatie { get; set; } = string.Empty;

    public bool InschrijvingGeopend { get; set; }
    public string Publicatiestatus { get; set; } = string.Empty;

    // Geen InzetSchemaId of PraktischeInformatieId: de service maakt deze records aan
    [Required]
    public InzetSchemaDto InzetSchema { get; set; } = null!;

    [Required]
    public PraktischeInformatieDto PraktischeInformatie { get; set; } = null!;

    // Koppeltabel EvenementSponsor: alleen de id's van bestaande sponsors
    public List<int> SponsorIds { get; set; } = new();
}
