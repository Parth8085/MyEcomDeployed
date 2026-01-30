using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var host = emailSettings["Host"];
            var port = int.Parse(emailSettings["Port"]!);
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];

            // If config is dummy, simulate sending (or throw, but let's simulate and log to console)
            if (username == "your-email@gmail.com")
            {
                Console.WriteLine($"[Email Simulator] TO: {toEmail}\nSUBJECT: {subject}\nBODY: {body}");
                return;
            }

            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(username));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
