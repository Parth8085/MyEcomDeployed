using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Wishlist
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public List<WishlistItem> Items { get; set; } = new();
    }
}
