using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class RegisterDto
{
    [Required, StringLength(100)]
    public string Naam { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Wachtwoord { get; set; } = string.Empty;
}