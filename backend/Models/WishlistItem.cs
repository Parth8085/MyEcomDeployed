using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class WishlistItem
    {
        public int Id { get; set; }
        
        public int WishlistId { get; set; }
        
        public int ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
