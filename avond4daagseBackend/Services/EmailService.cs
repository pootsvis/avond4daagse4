
using System.Net;
using System.Net.Mail;

namespace Avond4DaagseBackend.Services;

public class EmailService(
    IConfiguration configuration
)
{
    public async Task VerstuurAsync(
        string ontvanger,
        string onderwerp,
        string bericht
    )
    {
        string host =
            configuration["Email:Host"] ?? "localhost";

        int port =
            configuration.GetValue<int?>("Email:Port")
            ?? 1025;

        string afzender =
            configuration["Email:From"]
            ?? "organisatie@avond4daagse.test";

        bool ssl =
            configuration.GetValue<bool>("Email:EnableSsl");

        string? gebruikersnaam =
            configuration["Email:Username"];

        string? wachtwoord =
            configuration["Email:Password"];

        using var mail = new MailMessage();

        mail.From = new MailAddress(
            afzender,
            "Avond4daagse 2027"
        );

        mail.To.Add(new MailAddress(ontvanger));

        mail.Subject = onderwerp;

        mail.Body = bericht;

        mail.IsBodyHtml = false;

        mail.SubjectEncoding =
            System.Text.Encoding.UTF8;

        mail.BodyEncoding =
            System.Text.Encoding.UTF8;

        using var smtp = new SmtpClient(
            host,
            port
        );

        smtp.EnableSsl = ssl;

        smtp.UseDefaultCredentials = false;

        if (!string.IsNullOrWhiteSpace(gebruikersnaam))
        {
            smtp.Credentials = new NetworkCredential(
                gebruikersnaam,
                wachtwoord
            );
        }

        using var timeout =
            new CancellationTokenSource(
                TimeSpan.FromSeconds(10)
            );

        await smtp.SendMailAsync(
            mail,
            timeout.Token
        );
    }
}
