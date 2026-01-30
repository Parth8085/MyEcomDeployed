using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Shipped, Delivered, Cancelled
        
        // Shipping Address Snapshot
        public string ShippingAddress { get; set; } = string.Empty; 
        
        public List<OrderItem> Items { get; set; } = new();
        
        public Payment? Payment { get; set; }
    }
}
