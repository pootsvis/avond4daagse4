namespace Avond4DaagseBackend.DTOs;

// Geen Update-DTO: een toewijzing met twee FK's wijzig je niet, je verwijdert hem en maakt een nieuwe
public class CreateTaaktoewijzingDto
{
    public int VrijwilligersId { get; set; }
    public int TaakId { get; set; }
}
