using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class CreateRolDto
{
    [Required, StringLength(50)]
    public string Naam { get; set; } = string.Empty;

    // Koppeltabel RolRecht: id's van bestaande rechten
    public List<int> RechtIds { get; set; } = new();
}
