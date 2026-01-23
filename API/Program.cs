using Amazon.S3;
using Amazon.SecurityToken;
using API.Data;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Addings CORS configuration
builder.Services.AddCors();

// JWT Authentication
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Cognito User Pool authority
        options.Authority = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_HT1EStlQB";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            NameClaimType = "sub", // optional but nice
            RoleClaimType = "cognito:groups",
        };
    });

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();
builder.Services.AddScoped<ILikesRepository, LikesRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IMemberAccessor, MemberAccessor>();

// AWS S3 Services
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSecurityTokenService>();
builder.Services.AddScoped<IS3Service, S3Service>();

builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.
// This is known as middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(options =>
    options
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins("http://localhost:4200", "https://localhost:4200")
);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.MigrateAndSeedDatabaseAsync();

app.Run();
