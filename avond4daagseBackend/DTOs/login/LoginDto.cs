using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Wachtwoord { get; set; } = string.Empty;
}