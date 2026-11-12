using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class UpdateRolDto
{
    [Required, StringLength(50)]
    public string Naam { get; set; } = string.Empty;

    public List<int> RechtIds { get; set; } = new();
}
