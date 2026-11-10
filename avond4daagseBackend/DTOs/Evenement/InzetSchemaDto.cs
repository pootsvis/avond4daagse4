namespace Avond4DaagseBackend.DTOs;

public class InzetSchemaDto
{
    public TimeOnly Tijd { get; set; }
    public DateOnly Datum { get; set; }
    public string Taak { get; set; } = string.Empty;
}
