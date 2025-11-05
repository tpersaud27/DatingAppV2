using API.Data;
using API.Interfaces;
using API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Addings CORS configuration
builder.Services.AddCors();

builder.Services.AddScoped<ITokenService, TokenService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
// This is known as middleware

app.UseCors(options =>
    options
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins("http://localhost:4200", "https://localhost:4200")
);
app.MapControllers();

app.Run();
