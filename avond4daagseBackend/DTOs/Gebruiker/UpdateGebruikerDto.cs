using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateGebruikerDto
{
    [Required, StringLength(100)]
    public string Naam { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
    // Geen wachtwoord: wijzigen krijgt een eigen endpoint
}
