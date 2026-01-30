using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ProductSpecification
    {
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        
        [Required]
        public string Key { get; set; } = string.Empty; // e.g. "RAM", "Screen Size"
        
        [Required]
        public string Value { get; set; } = string.Empty; // e.g. "8GB", "6.1 inch"
    }
}
