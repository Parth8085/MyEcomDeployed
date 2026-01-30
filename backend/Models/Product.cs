using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        public int Stock { get; set; }
        
        // Brand Relationship
        public int BrandId { get; set; }
        public Brand? Brand { get; set; }
        
        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        // New Relations
        public List<ProductImage> Images { get; set; } = new();
        public List<ProductSpecification> Specifications { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
