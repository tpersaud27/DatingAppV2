using Amazon.Lambda.AspNetCoreServer.Hosting;
using Amazon.S3;
using Amazon.SecretsManager;
using Amazon.SecurityToken;
using API.Data;
using API.Extensions;
using API.Infrastructure;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

Console.WriteLine("🚀 Lambda cold start: Program.cs entered");

var builder = WebApplication.CreateBuilder(args);

var env = builder.Environment;
Console.WriteLine($"🌎 Environment: {env.EnvironmentName}");
Console.WriteLine("Cognito UserPoolId: " + builder.Configuration["Cognito:UserPoolId"]);

// Decide where to read DB config from
string connectionString;

if (env.IsDevelopment())
{
    Console.WriteLine("🧪 Development environment detected");
    connectionString =
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing DefaultConnection in configuration.");
}
else
{
    Console.WriteLine("☁️ Lambda environment detected");

    var region = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1";
    var secretId =
        Environment.GetEnvironmentVariable("DB_SECRET_ID")
        ?? throw new InvalidOperationException("DB_SECRET_ID env var is required.");

    Console.WriteLine($"🔐 Fetching DB secret '{secretId}' from Secrets Manager in {region}...");
    connectionString = await SecretsManagerDbConfig.GetConnectionStringAsync(secretId, region);
    Console.WriteLine("✅ DB connection string loaded from Secrets Manager");
}

// Add services to the container.
Console.WriteLine("🧩 Registering services");

// Run behind API Gateway HTTP API (v2)
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
Console.WriteLine("🔗 AWS Lambda HTTP API hosting enabled");

builder.Services.AddControllers();
Console.WriteLine("🎮 Controllers added");

// Register EF
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));
Console.WriteLine("🗄️ DbContext configured");

// CORS
builder.Services.AddCors();
Console.WriteLine("🌍 CORS configured");

// JWT Authentication
var poolId = builder.Configuration["Cognito:UserPoolId"];
Console.WriteLine($"🔑 Configuring JWT auth for Cognito pool {poolId}");
var aws_region = "us-east-1";
var issuer = $"https://cognito-idp.{aws_region}.amazonaws.com/{poolId}";
Console.WriteLine($"Issuer {issuer}");

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = issuer; // ok
        options.MetadataAddress = issuer + "/.well-known/openid-configuration"; // explicit
        options.RequireHttpsMetadata = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,

            ValidateAudience = false, // or set ValidAudience to your app client id if you want
            NameClaimType = "sub",
            RoleClaimType = "cognito:groups",
        };
    });

// builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();
builder.Services.AddScoped<ILikesRepository, LikesRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IMemberAccessor, MemberAccessor>();
Console.WriteLine("📦 Application services registered");

// AWS services
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSecurityTokenService>();
builder.Services.AddScoped<IS3Service, S3Service>();
Console.WriteLine("☁️ AWS SDK services registered");

builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();

Console.WriteLine("🏗️ Building app");
var app = builder.Build();
Console.WriteLine("✅ App built");

// Middleware
app.UseMiddleware<ExceptionMiddleware>();
Console.WriteLine("🧱 Exception middleware added");

app.UseCors(options =>
    options
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins("http://localhost:4200", "https://localhost:4200")
);
Console.WriteLine("🌐 CORS middleware added");

app.UseAuthentication();
app.UseAuthorization();
Console.WriteLine("🔐 Auth middleware added");

app.MapControllers();
Console.WriteLine("🗺️ Controllers mapped");

// Migrations (DEV ONLY)
if (app.Environment.IsDevelopment())
{
    Console.WriteLine("🧬 Running migrations (development only)");
    await app.MigrateAndSeedDatabaseAsync();
    Console.WriteLine("✅ Migrations complete");
}

Console.WriteLine("▶️ Starting web host");
app.Run();
