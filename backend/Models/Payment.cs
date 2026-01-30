using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Payment
    {
        public int Id { get; set; }
        
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Credit Card";
        public string Status { get; set; } = "Pending"; // Success, Failed
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    }
}
