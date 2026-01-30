using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Role
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty; // "Admin", "User"
    }
}
