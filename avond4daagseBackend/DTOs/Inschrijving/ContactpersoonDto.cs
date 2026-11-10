using System.ComponentModel.DataAnnotations;
namespace Avond4DaagseBackend.DTOs;

public class ContactpersoonDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Telefoonnummer { get; set; } = string.Empty;
}
