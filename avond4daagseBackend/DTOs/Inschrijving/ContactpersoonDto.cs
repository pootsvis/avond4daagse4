using System.ComponentModel.DataAnnotations;
namespace Avond4DaagseBackend.DTOs;

public class ContactpersoonDto
{
    [EmailAddress]
    public string? Email { get; set; } = string.Empty;
    
    public string? Telefoonnummer { get; set; } = string.Empty;
}
