namespace Avond4DaagseBackend.DTOs;

public class GebruikerResponse
{
    public int GebruikerId { get; set; }
    public string Naam { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // Nooit het wachtwoord (of de hash) teruggeven
}
