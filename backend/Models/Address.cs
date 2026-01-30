using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Address
    {
        public int Id { get; set; }
        
        [Required]
        public string Street { get; set; } = string.Empty;
        
        [Required]
        public string City { get; set; } = string.Empty;
        
        [Required]
        public string State { get; set; } = string.Empty;
        
        [Required]
        public string ZipCode { get; set; } = string.Empty;
        
        [Required]
        public string Country { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
