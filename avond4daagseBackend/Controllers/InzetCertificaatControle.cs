
using Avond4DaagseBackend.Data;
using Avond4DaagseBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace Avond4DaagseBackend.Controllers;

internal static class InzetCertificaatControle
{
    internal static async Task<string?> Controleer(
        ApplicationDbContext context,
        Vrijwilliger vrijwilliger,
        string dienstNaam
    )
    {
        // Alleen routeposten vereisen voorlopig
        // een goedgekeurd verkeersregelaarcertificaat.

        bool certificaatVereist = string.Equals(
            dienstNaam,
            "Routeposten",
            StringComparison.OrdinalIgnoreCase
        );

        if (!certificaatVereist)
        {
            return null;
        }

        if (!vrijwilliger.GebruikerId.HasValue)
        {
            return "Deze vrijwilliger heeft geen " +
                "gekoppeld verkeersregelaaraccount.";
        }

        bool isVerkeersregelaar =
            await context.GebruikerRollen.AnyAsync(gr =>
                gr.GebruikerId == vrijwilliger.GebruikerId &&
                gr.Rol.Naam == "Verkeersregelaars"
            );

        if (!isVerkeersregelaar)
        {
            return "Voor deze dienst is de rol " +
                "Verkeersregelaar vereist.";
        }

        if (vrijwilliger.CertificaatBestand == null ||
            vrijwilliger.CertificaatBestand.Length == 0)
        {
            return "Deze verkeersregelaar heeft " +
                "nog geen certificaat geüpload.";
        }

        if (vrijwilliger.CertificaatStatus != "Goedgekeurd")
        {
            return "Deze verkeersregelaar heeft geen " +
                "goedgekeurd certificaat. Huidige status: " +
                vrijwilliger.CertificaatStatus + ".";
        }

        return null;
    }
}
