using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateDraaiboektaakDto
{
    [Required, StringLength(150)]
    public string Titel { get; set; } = string.Empty;

    public string Beschrijving { get; set; } = string.Empty;
    public DateOnly Datum { get; set; }
    public string Categorie { get; set; } = string.Empty;

    [Required]
    public string Status { get; set; } = string.Empty;

    public string Verantwoordelijke { get; set; } = string.Empty;
    public List<int> GebruikerIds { get; set; } = new();
}
