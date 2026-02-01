using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Dashboard Statistics
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalOrders = await _context.Orders.CountAsync();
            var totalProducts = await _context.Products.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending");
            var processingOrders = await _context.Orders.CountAsync(o => o.Status == "Processing");
            var shippedOrders = await _context.Orders.CountAsync(o => o.Status == "Shipped");
            var deliveredOrders = await _context.Orders.CountAsync(o => o.Status == "Delivered");

            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .Select(o => new AdminOrderDto
                {
                    Id = o.Id,
                    OrderNumber = $"ORD{o.Id:D6}",
                    CustomerName = o.User!.Name,
                    CustomerEmail = o.User.Email,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    ItemCount = o.Items.Count
                })
                .ToListAsync();

            return Ok(new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalOrders = totalOrders,
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue,
                PendingOrders = pendingOrders,
                ProcessingOrders = processingOrders,
                ShippedOrders = shippedOrders,
                DeliveredOrders = deliveredOrders,
                RecentOrders = recentOrders
            });
        }

        // Get All Orders (Admin View)
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<AdminOrderDto>>> GetAllOrders(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Payment)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            var totalOrders = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new AdminOrderDto
                {
                    Id = o.Id,
                    OrderNumber = $"ORD{o.Id:D6}",
                    CustomerName = o.User!.Name,
                    CustomerEmail = o.User.Email,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    TrackingNumber = o.TrackingNumber,
                    PaymentMethod = o.Payment!.PaymentMethod,
                    PaymentStatus = o.Payment.Status,
                    ItemCount = o.Items.Count,
                    ShippingAddress = $"{o.ShippingAddress}, {o.ShippingCity}, {o.ShippingState} {o.ShippingZipCode}"
                })
                .ToListAsync();

            return Ok(new
            {
                orders,
                totalOrders,
                currentPage = page,
                totalPages = (int)Math.Ceiling(totalOrders / (double)pageSize)
            });
        }

        // Get Single Order Details (Admin)
        [HttpGet("orders/{id}")]
        public async Task<ActionResult<AdminOrderDetailDto>> GetOrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .ThenInclude(p => p!.Brand)
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            return Ok(new AdminOrderDetailDto
            {
                Id = order.Id,
                OrderNumber = $"ORD{order.Id:D6}",
                CustomerName = order.User!.Name,
                CustomerEmail = order.User.Email,
                CustomerPhone = order.ShippingPhone,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                TrackingNumber = order.TrackingNumber,
                ShippedDate = order.ShippedDate,
                DeliveredDate = order.DeliveredDate,
                ExpectedDeliveryDate = order.ExpectedDeliveryDate,
                ShippingAddress = order.ShippingAddress,
                ShippingCity = order.ShippingCity,
                ShippingState = order.ShippingState,
                ShippingZipCode = order.ShippingZipCode,
                ShippingPhone = order.ShippingPhone,
                Items = order.Items.Select(oi => new AdminOrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    Brand = oi.Product?.Brand?.Name ?? "",
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Total = oi.Price * oi.Quantity
                }).ToList(),
                PaymentMethod = order.Payment?.PaymentMethod ?? "",
                PaymentStatus = order.Payment?.Status ?? "",
                TransactionId = order.Payment?.TransactionId ?? ""
            });
        }

        // Update Order Status
        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = request.Status;

            if (request.Status == "Shipped" && !order.ShippedDate.HasValue)
            {
                order.ShippedDate = DateTime.UtcNow;
                order.TrackingNumber = request.TrackingNumber ?? GenerateTrackingNumber();
            }

            if (request.Status == "Delivered" && !order.DeliveredDate.HasValue)
            {
                order.DeliveredDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Order status updated successfully", order });
        }

        // Get All Users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var totalUsers = await _context.Users.CountAsync();
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Orders)
                .OrderByDescending(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber ?? "",
                    Role = u.Role!.Name,
                    IsPhoneVerified = u.IsPhoneVerified,
                    TotalOrders = u.Orders.Count,
                    TotalSpent = u.Orders.Where(o => o.Status != "Cancelled").Sum(o => o.TotalAmount)
                })
                .ToListAsync();

            return Ok(new
            {
                users,
                totalUsers,
                currentPage = page,
                totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize)
            });
        }

        // Get All Products (Admin View)
        [HttpGet("products")]
        public async Task<ActionResult<IEnumerable<AdminProductDto>>> GetAllProducts(
            [FromQuery] string? category = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 1000)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category!.Name == category);
            }

            var totalProducts = await query.CountAsync();
            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new AdminProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Brand = p.Brand!.Name,
                    Category = p.Category!.Name,
                    Price = p.Price,
                    Stock = p.Stock,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(new
            {
                products,
                totalProducts,
                currentPage = page,
                totalPages = (int)Math.Ceiling(totalProducts / (double)pageSize)
            });
        }

        // Update Product Stock
        [HttpPut("products/{id}/stock")]
        public async Task<IActionResult> UpdateProductStock(int id, [FromBody] UpdateStockRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Stock = request.Stock;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock updated successfully", product });
        }

        // Update Product Price
        [HttpPut("products/{id}/price")]
        public async Task<IActionResult> UpdateProductPrice(int id, [FromBody] UpdatePriceRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Price = request.Price;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Price updated successfully", product });
        }

        // Helper Methods
        private string GenerateTrackingNumber()
        {
            return $"TRK{DateTime.UtcNow:yyyyMMdd}{new Random().Next(10000, 99999)}";
        }
    }

    // DTOs
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippedOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public List<AdminOrderDto> RecentOrders { get; set; } = new();
    }

    public class AdminOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
    }

    public class AdminOrderDetailDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string? ShippingCity { get; set; }
        public string? ShippingState { get; set; }
        public string? ShippingZipCode { get; set; }
        public string? ShippingPhone { get; set; }
        public List<AdminOrderItemDto> Items { get; set; } = new();
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }

    public class AdminOrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }

    public class AdminUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsPhoneVerified { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
    }


    public class AdminProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateStockRequest
    {
        public int Stock { get; set; }
    }

    public class UpdatePriceRequest
    {
        public decimal Price { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
    }
}
