using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] string? category)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Specifications)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category!.Name == category);
            }

            var products = await query.ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Brand = p.Brand?.Name ?? "",
                Category = p.Category?.Name ?? "",
                Images = p.Images.Select(i => i.ImageUrl).ToList(),
                Specifications = p.Specifications.ToDictionary(s => s.Key, s => s.Value)
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }
        
        // Admin only
        [HttpPost]
        // [Authorize(Roles = "Admin")] // Uncomment when middleware is ready
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
             _context.Products.Add(product);
             await _context.SaveChangesAsync();
             return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPost("compare")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> CompareProducts([FromBody] List<int> productIds)
        {
            if (productIds == null || !productIds.Any())
            {
                 return BadRequest("No products selected.");
            }

            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Specifications)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

             return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Brand = p.Brand?.Name ?? "",
                Category = p.Category?.Name ?? "",
                Images = p.Images.Select(i => i.ImageUrl).ToList(),
                Specifications = p.Specifications.ToDictionary(s => s.Key, s => s.Value)
            }).ToList();
        }
    }
}
