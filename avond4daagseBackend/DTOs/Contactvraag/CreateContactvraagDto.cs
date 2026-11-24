using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

// Wat het publieke contactformulier verstuurt
public class CreateContactvraagDto
{
    [Required, StringLength(50)]
    public string Voornaam { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Achternaam { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(150)]
    public string Onderwerp { get; set; } = string.Empty;

    [Required, StringLength(2000)]
    public string Bericht { get; set; } = string.Empty;
}
