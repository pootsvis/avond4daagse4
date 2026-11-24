namespace Avond4DaagseBackend.DTOs;

public class RolResponse
{
    public int RolId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public List<int> RechtIds { get; set; } = new();
}
