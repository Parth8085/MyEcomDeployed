using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Brand
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        
        public List<Product> Products { get; set; } = new();
    }
}
