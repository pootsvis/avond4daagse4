using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;
public class UpdateInschrijvingDto
{
    [Range(1, 1000)]
    public int AantalDeelnemers { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;
}
