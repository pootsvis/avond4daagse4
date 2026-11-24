using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateSponsorDto
{
    [Required, StringLength(100)]
    public string Naam { get; set; } = string.Empty;
}
