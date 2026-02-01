using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(x =>
{
   x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
   x.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddHttpClient();

// Database Context (MySQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 21))));

// Authentication (JWT)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "E-Commerce API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        In = ParameterLocation.Header, 
        Description = "Please insert JWT with Bearer into field",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey 
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
       {
         new OpenApiSecurityScheme
         {
           Reference = new OpenApiReference
           {
             Type = ReferenceType.SecurityScheme,
             Id = "Bearer"
           }
          },
          new string[] { }
        }
    });
});

// Email Service
builder.Services.AddScoped<Backend.Services.IEmailService, Backend.Services.EmailService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure admin user exists
// Ensure admin user exists
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // Test connection
        await context.Database.CanConnectAsync();

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@smartkartstore.com");
        
        if (adminUser == null)
        {
            var admin = new Backend.Models.User
            {
                Name = "Admin User",
                Email = "admin@smartkartstore.com",
                PhoneNumber = "1234567890",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                RoleId = 1,
                IsPhoneVerified = true
            };
            
            context.Users.Add(admin);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Admin user created: admin@smartkartstore.com / Admin@123");
        }
        else
        {
            // Update password to ensure it's correct
            adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            adminUser.RoleId = 1;
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Admin user verified: admin@smartkartstore.com / Admin@123");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database Initialization Failed: {ex.Message}");
        // We do NOT rethrow here, so the app can start and display the error on /diagnostics
        StartupErrors.DbError = ex.ToString();
    }
}

// Add a diagnostic endpoint
app.MapGet("/diagnostics", () => 
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    var maskedConnString = System.Text.RegularExpressions.Regex.Replace(connectionString ?? "", "password=.*?;", "password=******;", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    
    return Results.Ok(new 
    { 
        Status = string.IsNullOrEmpty(StartupErrors.DbError) ? "Healthy" : "Database Connection Failed",
        Timestamp = DateTime.UtcNow,
        Environment = app.Environment.EnvironmentName,
        ConnectionStringConfigured = !string.IsNullOrEmpty(connectionString),
        MaskedConnectionString = maskedConnString,
        LastError = StartupErrors.DbError
    });
});

app.Run();

public static class StartupErrors
{
    public static string? DbError { get; set; }
}
