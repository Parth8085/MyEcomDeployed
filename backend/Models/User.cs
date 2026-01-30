using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [JsonIgnore]
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // Foreign Key for Role
        public int RoleId { get; set; }
        public Role? Role { get; set; }

        public List<Address> Addresses { get; set; } = new();
        public List<Order> Orders { get; set; } = new();

        // Refresh Token
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // OTP & Phone Support
        [Phone]
        public string? PhoneNumber { get; set; }
        public bool IsPhoneVerified { get; set; } = false;
        
        [JsonIgnore]
        public string? Otp { get; set; } // Used for both Phone verification and Password reset
        public DateTime? OtpExpiry { get; set; }
    }
}
