using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "User" }
            );

            // Seed Categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Mobiles", ImageUrl = "https://loremflickr.com/320/240/smartphone?lock=1" },
                new Category { Id = 2, Name = "Laptops", ImageUrl = "https://loremflickr.com/320/240/laptop?lock=1" },
                new Category { Id = 3, Name = "Accessories", ImageUrl = "https://loremflickr.com/320/240/gadget?lock=1" }
            );
            
            // Seed Brands (Using Clearbit Logo API)
            modelBuilder.Entity<Brand>().HasData(
                new Brand { Id = 1, Name = "Apple", ImageUrl = "https://logo.clearbit.com/apple.com" },
                new Brand { Id = 2, Name = "Samsung", ImageUrl = "https://logo.clearbit.com/samsung.com" },
                new Brand { Id = 3, Name = "Sony", ImageUrl = "https://logo.clearbit.com/sony.com" },
                new Brand { Id = 4, Name = "Dell", ImageUrl = "https://logo.clearbit.com/dell.com" },
                new Brand { Id = 5, Name = "HP", ImageUrl = "https://logo.clearbit.com/hp.com" },
                new Brand { Id = 6, Name = "Asus", ImageUrl = "https://logo.clearbit.com/asus.com" },
                new Brand { Id = 7, Name = "Xiaomi", ImageUrl = "https://logo.clearbit.com/mi.com" },
                new Brand { Id = 8, Name = "OnePlus", ImageUrl = "https://logo.clearbit.com/oneplus.com" },
                new Brand { Id = 9, Name = "Logitech", ImageUrl = "https://logo.clearbit.com/logitech.com" },
                new Brand { Id = 10, Name = "JBL", ImageUrl = "https://logo.clearbit.com/jbl.com" }
            );

            // Helper to generate products
            var products = new List<Product>();
            var specs = new List<ProductSpecification>();
            var images = new List<ProductImage>();
            int pId = 1;
            int sId = 1;
            int iId = 1;

            // --- Mobiles (Category 1) ---
            var mobileSpecs = new Dictionary<string, List<string>> {
                { "Processor", new List<string> { "Snapdragon 8 Gen 3", "A17 Pro", "Dimensity 9300", "Exynos 2400", "A16 Bionic" } },
                { "RAM", new List<string> { "8GB", "12GB", "16GB" } },
                { "Storage", new List<string> { "128GB", "256GB", "512GB", "1TB" } },
                { "Screen Size", new List<string> { "6.1 inch", "6.7 inch", "6.8 inch" } },
                { "Battery", new List<string> { "4000mAh", "5000mAh", "4500mAh" } },
                { "Camera", new List<string> { "48MP Main", "50MP Main", "108MP Main", "200MP Main" } },
                { "OS", new List<string> { "iOS 17", "Android 14" } },
                { "Network", new List<string> { "5G", "4G LTE" } }
            };

            var mobiles = new[] {
                ("iPhone 15 Pro", "Apple", 1, 134900m), ("iPhone 15", "Apple", 1, 79900m), ("iPhone 14", "Apple", 1, 69900m),
                ("iPhone 13", "Apple", 1, 59900m), ("Samsung Galaxy S24 Ultra", "Samsung", 2, 129999m), ("Samsung Galaxy S24", "Samsung", 2, 79999m),
                ("Samsung Galaxy S23 FE", "Samsung", 2, 39999m), ("Samsung Galaxy Z Fold5", "Samsung", 2, 154999m), ("Xiaomi 14 Ultra", "Xiaomi", 7, 99999m),
                ("Xiaomi 14", "Xiaomi", 7, 69999m), ("Redmi Note 13 Pro", "Xiaomi", 7, 25999m), ("OnePlus 12", "OnePlus", 8, 64999m),
                ("OnePlus 12R", "OnePlus", 8, 39999m), ("OnePlus Nord CE4", "OnePlus", 8, 24999m), ("Sony Xperia 1 V", "Sony", 3, 119990m),
                ("Samsung A55", "Samsung", 2, 39999m), ("iPhone SE", "Apple", 1, 49900m), ("Asus ROG Phone 8", "Asus", 6, 94999m),
                ("Poco X6 Pro", "Xiaomi", 7, 26999m), ("Pixel 8 Pro", "Samsung", 2, 106999m)
            };

            foreach (var m in mobiles) {
                products.Add(new Product { Id = pId, Name = m.Item1, Description = $"High performance {m.Item1} by {m.Item2}", Price = m.Item4, Stock = 20, BrandId = m.Item3, CategoryId = 1 });
                
                // Add Detailed Specs
                var rand = new Random(pId); // Use pId seed for deterministic seeding
                foreach(var specKey in mobileSpecs.Keys) {
                     var val = mobileSpecs[specKey][rand.Next(mobileSpecs[specKey].Count)];
                     // Logic checks
                     if(m.Item1.Contains("iPhone") && specKey == "OS") val = "iOS 17";
                     if(m.Item1.Contains("iPhone") && specKey == "Processor" && !val.Contains("A")) val = "A17 Pro";
                     if(!m.Item1.Contains("iPhone") && specKey == "OS") val = "Android 14";
                     
                     specs.Add(new ProductSpecification { Id = sId++, ProductId = pId, Key = specKey, Value = val });
                }

                // Random real phone image
                images.Add(new ProductImage { Id = iId++, ProductId = pId, IsPrimary = true, ImageUrl = $"https://loremflickr.com/500/500/smartphone,mobile?lock={pId}" });
                pId++;
            }

            // --- Laptops (Category 2) ---
            var laptopSpecs = new Dictionary<string, List<string>> {
                    { "Processor", new List<string> { "M3 Pro", "Intel Core i7", "Intel Core i9", "Ryzen 7", "Ryzen 9" } },
                    { "RAM", new List<string> { "16GB", "32GB", "8GB", "64GB" } },
                    { "SSD", new List<string> { "512GB", "1TB", "2TB" } },
                    { "Graphics", new List<string> { "Integrated", "RTX 4060", "RTX 4070", "M3 GPU" } },
                    { "Screen Size", new List<string> { "13.3 inch", "14 inch", "15.6 inch", "16 inch" } },
                    { "Battery", new List<string> { "60Wh", "70Wh", "90Wh" } },
                    { "OS", new List<string> { "macOS Sonoma", "Windows 11 Home", "Windows 11 Pro" } },
                    { "Warranty", new List<string> { "1 Year", "2 Years" } }
            };

            var laptops = new[] {
                ("MacBook Pro M3", "Apple", 1, 169900m), ("MacBook Air M2", "Apple", 1, 99900m), ("MacBook Air M1", "Apple", 1, 69900m),
                ("Dell XPS 13", "Dell", 4, 119990m), ("Dell XPS 15", "Dell", 4, 149990m), ("Dell Inspiron 15", "Dell", 4, 45990m),
                ("Dell G15 Gaming", "Dell", 4, 75990m), ("HP Spectre x360", "HP", 5, 135990m), ("HP Pavilion 15", "HP", 5, 55990m),
                ("HP Omen 16", "HP", 5, 105990m), ("Asus ZenBook 14", "Asus", 6, 96990m), ("Asus Vivobook 16", "Asus", 6, 49990m),
                ("Asus ROG Strix G16", "Asus", 6, 115990m), ("Asus TUF Gaming F15", "Asus", 6, 59990m), ("Samsung Galaxy Book4", "Samsung", 2, 85990m),
                ("Samsung Galaxy Book3", "Samsung", 2, 65990m), ("Xiaomi Notebook Pro", "Xiaomi", 7, 52999m), ("Xiaomi Notebook Ultra", "Xiaomi", 7, 62999m),
                ("MacBook Pro 16", "Apple", 1, 249900m), ("Dell Alienware m16", "Dell", 4, 189990m)
            };

            foreach (var l in laptops) {
                products.Add(new Product { Id = pId, Name = l.Item1, Description = $"Powerful {l.Item1} for work and play.", Price = l.Item4, Stock = 15, BrandId = l.Item3, CategoryId = 2 });
                
                var rand = new Random(pId);
                foreach(var key in laptopSpecs.Keys) {
                    var val = laptopSpecs[key][rand.Next(laptopSpecs[key].Count)];
                     // Logic checks
                     if(l.Item1.Contains("MacBook") && key == "OS") val = "macOS Sonoma";
                     if(!l.Item1.Contains("MacBook") && key == "OS" && val.Contains("macOS")) val = "Windows 11 Home";

                    specs.Add(new ProductSpecification { Id = sId++, ProductId = pId, Key = key, Value = val });
                }

                // Random real laptop image
                images.Add(new ProductImage { Id = iId++, ProductId = pId, IsPrimary = true, ImageUrl = $"https://loremflickr.com/500/500/laptop,computer?lock={pId}" });
                pId++;
            }

            // --- Accessories (Category 3) ---
            var accSpecs = new Dictionary<string, List<string>> {
                    { "Type", new List<string> { "Wireless", "Wired", "Bluetooth" } },
                    { "Compatibility", new List<string> { "Universal", "iOS", "Android", "Windows" } },
                    { "Warranty", new List<string> { "6 Months", "1 Year" } },
                    { "Color", new List<string> { "Black", "White", "Red", "Blue" } },
                    { "Material", new List<string> { "Plastic", "Metal", "Silicon", "Fabric" } },
                    { "Dimensions", new List<string> { "Compact", "Standard", "Large" } },
                    { "Connection", new List<string> { "USB-C", "Lightning", "3.5mm Jack" } },
                    { "Weight", new List<string> { "Lightweight", "Heavy Duty" } }
            };

            var accessories = new[] {
                ("AirPods Pro 2", "Apple", 1, 24900m), ("Samsung Galaxy Buds2", "Samsung", 2, 9999m), ("Sony WH-1000XM5", "Sony", 3, 29990m),
                ("Sony WH-1000XM4", "Sony", 3, 19990m), ("JBL Flip 6", "JBL", 10, 9999m), ("JBL Charge 5", "JBL", 10, 15999m),
                ("Logitech MX Master 3S", "Logitech", 9, 9995m), ("Logitech K380", "Logitech", 9, 2995m), ("Dell Wireless Mouse", "Dell", 4, 899m),
                ("HP Gaming Mouse", "HP", 5, 1299m), ("Apple Magic Mouse", "Apple", 1, 7500m), ("Samsung 25W Charger", "Samsung", 2, 1299m),
                ("OnePlus 100W Charger", "OnePlus", 8, 2999m), ("Xiaomi Power Bank 20000", "Xiaomi", 7, 2199m), ("Sony SRS-XB13", "Sony", 3, 3990m),
                ("Asus ROG Cetra", "Asus", 6, 6999m), ("Logitech G502 Hero", "Logitech", 9, 3995m), ("Apple Watch Series 9", "Apple", 1, 41900m),
                ("Samsung Galaxy Watch6", "Samsung", 2, 29999m), ("OnePlus Watch 2", "OnePlus", 8, 24999m),
                // 30 More
                ("Samsung T7 SSD 1TB", "Samsung", 2, 12999m), ("SanDisk Extreme 128GB", "Dell", 4, 1999m), ("Logitech C920 Webcam", "Logitech", 9, 6495m),
                ("Razer DeathAdder V3", "Logitech", 9, 5999m), ("Keychron K2 Keyboard", "Logitech", 9, 8999m), ("Apple MagSafe Charger", "Apple", 1, 4500m),
                ("Anker 737 Power Bank", "Samsung", 2, 14999m), ("Sony WH-CH720N", "Sony", 3, 9990m), ("Bose QC Ultra", "Sony", 3, 29900m),
                ("Google Pixel Buds Pro", "Samsung", 2, 19990m), ("Samsung SmartTag2", "Samsung", 2, 2499m), ("Apple AirTag (4 Pack)", "Apple", 1, 11900m),
                ("WD Elements 2TB HDD", "Dell", 4, 6999m), ("Seagate One Touch 5TB", "Dell", 4, 11999m), ("TP-Link Archer AX73", "Dell", 4, 9999m),
                ("Netgear Nighthawk M6", "Dell", 4, 24999m), ("Chromecast with Google TV", "Samsung", 2, 4999m), ("Fire TV Stick 4K", "Samsung", 2, 5999m),
                ("Apple Pencil (2nd Gen)", "Apple", 1, 11900m), ("Samsung S Pen Pro", "Samsung", 2, 8999m), ("Logitech MX Keys S", "Logitech", 9, 10995m),
                ("Razer BlackShark V2", "Logitech", 9, 14999m), ("HyperX Cloud III", "HP", 5, 8990m), ("SteelSeries Arctis Nova", "HP", 5, 17999m),
                ("Corsair K70 MAX", "HP", 5, 19999m), ("Elgato Stream Deck", "HP", 5, 14999m), ("DJI Osmo Mobile 6", "Sony", 3, 13990m),
                ("GoPro Hero 12 Black", "Sony", 3, 39990m), ("Insta360 X3", "Sony", 3, 44990m), ("Fitbit Charge 6", "Samsung", 2, 14999m)
            };

            foreach (var a in accessories) {
                products.Add(new Product { Id = pId, Name = a.Item1, Description = $"Essential accessory: {a.Item1}", Price = a.Item4, Stock = 50, BrandId = a.Item3, CategoryId = 3 });
                
                var rand = new Random(pId);
                foreach(var key in accSpecs.Keys) {
                    var val = accSpecs[key][rand.Next(accSpecs[key].Count)];
                    specs.Add(new ProductSpecification { Id = sId++, ProductId = pId, Key = key, Value = val });
                }

                // Determine better keyword for accessories
                string keyword = "tech";
                string n = a.Item1.ToLower();
                if (n.Contains("headphone") || n.Contains("sony wh") || n.Contains("bose") || n.Contains("cloud") || n.Contains("blackshark")) keyword = "headphone";
                else if (n.Contains("buds") || n.Contains("airpods") || n.Contains("cetra")) keyword = "earbuds";
                else if (n.Contains("mouse") || n.Contains("deathadder")) keyword = "computer mouse";
                else if (n.Contains("keyboard") || n.Contains("keys")) keyword = "mechanical keyboard";
                else if (n.Contains("watch") || n.Contains("fitbit")) keyword = "smartwatch";
                else if (n.Contains("speaker") || n.Contains("jbl") || n.Contains("flip") || n.Contains("charge")) keyword = "wireless speaker";
                else if (n.Contains("camera") || n.Contains("gopro") || n.Contains("insta360") || n.Contains("osmo") || n.Contains("webcam")) keyword = "camera";
                else if (n.Contains("ssd") || n.Contains("hdd") || n.Contains("drive") || n.Contains("disk")) keyword = "harddrive";
                else if (n.Contains("charger") || n.Contains("power bank") || n.Contains("magsafe")) keyword = "charger";
                else if (n.Contains("pencil") || n.Contains("pen")) keyword = "pen";
                else if (n.Contains("router") || n.Contains("archer") || n.Contains("nighthawk")) keyword = "router";

                // Random real gadget image with specific keyword
                images.Add(new ProductImage { Id = iId++, ProductId = pId, IsPrimary = true, ImageUrl = $"https://loremflickr.com/500/500/{keyword.Replace(" ", ",")}" });
                pId++;
            }

            modelBuilder.Entity<Product>().HasData(products);
            modelBuilder.Entity<ProductSpecification>().HasData(specs);
            modelBuilder.Entity<ProductImage>().HasData(images);
        }
    }
}
