using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly Services.IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, Services.IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            if (_context.Users.Any(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists.");
            }
            if (_context.Users.Any(u => u.PhoneNumber == request.PhoneNumber))
            {
                return BadRequest("Phone number already exists.");
            }

            var otp = new Random().Next(100000, 999999).ToString();

            // Assign default role 'User' (ID 2 based on seed)
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                RoleId = 2, 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsPhoneVerified = false,
                Otp = otp,
                OtpExpiry = DateTime.Now.AddMinutes(10) // Valid for 10 mins
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send OTP via Email (or SMS in real world)
            // For now, assume Mobile OTP is simulated, or sent via email if we wanted.
            // But let's keep simulating Mobile OTP return for demo
             return Ok(new { message = "User registered. Please verify OTP sent to mobile.", otp = otp, devNote = "Displaying OTP for testing/demo purposes." });
        }

        [HttpPost("verify-phone")]
        public async Task<IActionResult> VerifyPhone(VerifyOtpDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
            if (user == null) return BadRequest("User not found.");

            if (user.Otp != request.Otp || user.OtpExpiry < DateTime.Now)
            {
                return BadRequest("Invalid or expired OTP.");
            }

            user.IsPhoneVerified = true;
            user.Otp = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();

            return Ok("Phone verified successfully.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest("User not found."); 

            var otp = new Random().Next(100000, 999999).ToString();
            user.Otp = otp;
            user.OtpExpiry = DateTime.Now.AddMinutes(10);
            await _context.SaveChangesAsync();

            // Send Email
            try {
                await _emailService.SendEmailAsync(user.Email, "Reset Password OTP", $"Your OTP is: <b>{otp}</b>");
                return Ok(new { message = "OTP sent to your email address." });
            } catch (Exception ex) {
                // For development purposes, if SMTP fails, we might see the error in console, 
                // but we should not return the OTP to the client if we want to force SMTP usage.
                
                // However, since the user might be testing without valid SMTP credentials yet:
                // We will return the error message.
                return StatusCode(500, new { message = "Failed to send email. Ensure SMTP is configured.", error = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
             var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
             if (user == null) return BadRequest("User not found.");

             if (user.Otp != request.Otp || user.OtpExpiry < DateTime.Now)
            {
                return BadRequest("Invalid or expired OTP.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Otp = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();

            return Ok("Password reset successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            Console.WriteLine($"[Login Attempt] Email: {request.Email}");

            // Case-insensitive search
            var user = _context.Users.Include("Role")
                                     .FirstOrDefault(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                Console.WriteLine("[Login Failed] User not found.");
                return BadRequest("User not found.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                Console.WriteLine("[Login Failed] Incorrect password.");
                return BadRequest("Incorrect password.");
            }
            
            // Optional: Block login if phone not verified? 
            // if (!user.IsPhoneVerified) return BadRequest("Please verify your phone number first.");

            var token = CreateToken(user);
            return Ok(new { token, user.Name, user.Email, Role = user.Role?.Name });
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTOs
    public class UserRegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserLoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class VerifyOtpDto 
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
