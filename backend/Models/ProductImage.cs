using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        // public Product? Product { get; set; } // Omitted to avoid circular cycle in serialization if not careful, or just JsonIgnore
        
        [Required]
        public string ImageUrl { get; set; } = string.Empty;
        
        public bool IsPrimary { get; set; }
    }
}
