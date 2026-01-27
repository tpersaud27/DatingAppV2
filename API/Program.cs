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

var builder = WebApplication.CreateBuilder(args);

var env = builder.Environment;

// Decide where to read DB config from
string connectionString;

if (env.IsDevelopment())
{
    connectionString =
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing DefaultConnection in configuration.");
}
else
{
    // In Lambda, set these as environment variables
    var region = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1";
    var secretId =
        Environment.GetEnvironmentVariable("DB_SECRET_ID")
        ?? throw new InvalidOperationException("DB_SECRET_ID env var is required.");

    connectionString = await SecretsManagerDbConfig.GetConnectionStringAsync(secretId, region);
}

// Add services to the container.

// This makes ASP.NET Core run behind API Gateway HTTP API (v2) when in Lambda
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddControllers();

// Register EF with the resolved connection string
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

// Addings CORS configuration
builder.Services.AddCors();

// JWT Authentication
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var CognitoUserPoolId = builder.Configuration["Cognito:UserPoolId"];
        // Cognito User Pool authority
        options.Authority = $"https://cognito-idp.us-east-1.amazonaws.com/{CognitoUserPoolId}";

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
