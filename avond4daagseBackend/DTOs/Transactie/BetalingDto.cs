using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class BetalingDto
{
    [Range(0.01, 1000000)]
    public decimal Bedrag { get; set; }

    public DateOnly Betaaldatum { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;
}
