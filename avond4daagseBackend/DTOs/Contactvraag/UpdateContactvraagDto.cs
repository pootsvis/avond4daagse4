using System.ComponentModel.DataAnnotations;
namespace Avond4DaagseBackend.DTOs;

// Alleen voor beheerders: status, concept-reactie en wie de vraag oppakt
public class UpdateContactvraagDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Conceptreactie { get; set; }

    public int? GebruikerId { get; set; }
}
