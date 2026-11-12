using System.ComponentModel.DataAnnotations;

namespace Avond4DaagseBackend.DTOs;

public class DeelnameDto
{
    [Required, StringLength(100)]
    public string School { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Groep { get; set; } = string.Empty;

    [Range(1900, 2100)]
    public int Geboortejaar { get; set; }

    [Range(0, 100)]
    public int HoeveelheidKeer { get; set; }

    public bool NeemtBegeleiderMee { get; set; }
}
