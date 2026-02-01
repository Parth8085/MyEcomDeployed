using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var host = emailSettings["Host"];
            var port = int.Parse(emailSettings["Port"]!);
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];

            // Check if we are using the default/dummy configuration
            if (string.IsNullOrEmpty(username) || username == "your-email@gmail.com" || password == "your-app-password")
            {
                var logMsg = $"[Email Simulator] Time: {DateTime.Now}\nTO: {toEmail}\nSUBJECT: {subject}\nBODY: {body}\n--------------------------------------------------\n";
                Console.WriteLine(logMsg);
                
                // Write to a file for easy access
                await File.AppendAllTextAsync("latest_otp_log.txt", logMsg);
                return;
            }

            try 
            {
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
            catch (Exception ex)
            {
                 _logger.LogError(ex, "Failed to send email via SMTP.");
                 
                 // Fallback: Write to file so user is not completely blocked during dev/demo
                 var errLog = $"[SMTP FAILED - FALLBACK LOG] Time: {DateTime.Now}\nError: {ex.Message}\nTO: {toEmail}\nSUBJECT: {subject}\nBODY: {body}\n--------------------------------------------------\n";
                 await File.AppendAllTextAsync("latest_otp_log.txt", errLog);
                 
                 throw; // Re-throw so the controller knows something went wrong, or suppress if we want "soft" failure.
                 // The Controller currently handles exceptions by returning error message. 
                 // If we want the user to "succeed" in dev even if SMTP fails, we could suppress. 
                 // But the user said "use smtp". So if SMTP fails, they should know.
                 // However, the fallback log allows them to continue.
            }
        }
    }
}
