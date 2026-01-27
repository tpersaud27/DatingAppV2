using Amazon.S3;
using Amazon.SecurityToken;
using API.Data;
using API.Extensions;
using API.Infrastructure;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication;
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
// NOTE: In production we use API Gateway JWT Authorizer (Cognito) to validate tokens.
// The Authorizer injects claims into request headers via parameter mapping, so Lambda does NOT need internet/NAT.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
Console.WriteLine("🔗 AWS Lambda HTTP API hosting enabled");

builder.Services.AddControllers();
Console.WriteLine("🎮 Controllers added");

try
{
    var csb = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
    Console.WriteLine(
        $"🧪 DB Host={csb.Host}, Database={csb.Database}, Username={csb.Username}, Port={csb.Port}"
    );
}
catch
{
    Console.WriteLine("⚠️ Could not parse connection string for logging");
}

// Register EF
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));
Console.WriteLine("🗄️ DbContext configured");

// CORS
builder.Services.AddCors();
Console.WriteLine("🌍 CORS configured");

// ---------------------------
// Authentication & Authorization
// ---------------------------
// DEV: Use JwtBearer locally (Angular on localhost can hit API directly, and the machine has internet access)
// PROD (Lambda/VPC): Use trusted headers populated by API Gateway JWT Authorizer parameter mapping
//   Header x-auth-sub      = $context.authorizer.jwt.claims.sub
//   Header x-auth-email    = $context.authorizer.jwt.claims.email
//   Header x-auth-username = $context.authorizer.jwt.claims['cognito:username']
//
// IMPORTANT: Ensure Lambda is only invokable via API Gateway (no Function URL / no public invoke),
// otherwise someone could spoof these headers.
var poolId = builder.Configuration["Cognito:UserPoolId"];
var aws_region = "us-east-1";
var issuer = $"https://cognito-idp.{aws_region}.amazonaws.com/{poolId}";
Console.WriteLine($"Issuer {issuer}");

if (env.IsDevelopment())
{
    Console.WriteLine($"🔑 Configuring JWT Bearer auth (development) for Cognito pool {poolId}");

    builder
        .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = issuer;
            options.MetadataAddress = issuer + "/.well-known/openid-configuration";
            options.RequireHttpsMetadata = true;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,

                // Keep false if you don't want audience enforcement.
                // If you DO want to enforce it, set:
                // ValidateAudience = true,
                // ValidAudience = builder.Configuration["Cognito:AppClientId"]
                ValidateAudience = false,

                NameClaimType = "sub",
                RoleClaimType = "cognito:groups",
            };
        });

    builder.Services.AddAuthorization();
}
else
{
    Console.WriteLine("🔐 Configuring API Gateway trusted-header auth (production)");

    builder
        .Services.AddAuthentication("ApiGateway")
        .AddScheme<AuthenticationSchemeOptions, APIGatewayClaimsAuthHandler>(
            "ApiGateway",
            _ => { }
        );

    builder.Services.AddAuthorization();
}

// Cors Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DevCors",
        policy =>
            policy
                .WithOrigins("http://localhost:4200", "https://localhost:4200")
                .AllowAnyMethod()
                .AllowAnyHeader()
    );
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

app.UseCors("DevCors");
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
