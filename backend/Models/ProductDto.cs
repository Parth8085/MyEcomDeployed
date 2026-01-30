namespace Backend.Models
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new();
        public Dictionary<string, string> Specifications { get; set; } = new();
    }
}
