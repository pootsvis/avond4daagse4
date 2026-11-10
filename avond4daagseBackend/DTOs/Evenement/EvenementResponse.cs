namespace Avond4DaagseBackend.DTOs;

public class EvenementResponse
{
    public int EvenementId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Beschrijving { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public string Locatie { get; set; } = string.Empty;
    public bool InschrijvingGeopend { get; set; }
    public string Publicatiestatus { get; set; } = string.Empty;
    public InzetSchemaDto InzetSchema { get; set; } = null!;
    public PraktischeInformatieDto PraktischeInformatie { get; set; } = null!;
    public List<int> SponsorIds { get; set; } = new();
}
