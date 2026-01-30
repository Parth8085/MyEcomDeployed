using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        
        public int CartId { get; set; }
        public Cart? Cart { get; set; }
        
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        public int Quantity { get; set; }
        
        // Snapshot price in case product price changes? 
        // Or live price? Usually Cart uses live price, Order uses snapshot. 
        // But for CartItem it's often just link.
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Can store current price for caching
    }
}
