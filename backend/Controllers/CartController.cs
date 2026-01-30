using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null) return 0;
            return int.Parse(idClaim.Value);
        }

        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .ThenInclude(p => p.Images) // Include images for display
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                // Return empty cart structure
                return Ok(new { items = new List<object>(), totalAmount = 0 });
            }

            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
            }

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null) return NotFound("Product not found");

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    Price = product.Price // Snapshot price
                });
            }

            await _context.SaveChangesAsync();
            return Ok(cart); // Return updated cart
        }

        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Cart not found");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                cart.Items.Remove(item);
                await _context.SaveChangesAsync();
            }

            return Ok(cart);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateQuantity([FromBody] AddToCartDto request)
        {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product) // Return full product details for UI updates
                .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Cart not found");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (item == null) return NotFound("Item not found in cart");

            if (request.Quantity <= 0)
            {
                cart.Items.Remove(item);
            }
            else
            {
                item.Quantity = request.Quantity;
            }

            await _context.SaveChangesAsync();
            return Ok(cart);
        }
    }

    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
