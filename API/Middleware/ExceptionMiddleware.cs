using System.Net;
using System.Text.Json;
using API.Errors;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Middleware
{
    public class ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment env
    )
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                var traceId = context.TraceIdentifier;

                logger.LogError(
                    ex,
                    "Unhandled exception | TraceId={TraceId} | {Method} {Path}",
                    traceId,
                    context.Request.Method,
                    context.Request.Path
                );

                context.Response.ContentType = "application/json";

                var statusCode = ex switch
                {
                    UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                    SecurityTokenException => StatusCodes.Status401Unauthorized,
                    ArgumentException => StatusCodes.Status400BadRequest,
                    InvalidOperationException => StatusCodes.Status400BadRequest,
                    DbUpdateException => StatusCodes.Status409Conflict,
                    _ => StatusCodes.Status500InternalServerError,
                };

                context.Response.StatusCode = statusCode;

                var response = new ApiException
                {
                    StatusCode = statusCode,
                    Message =
                        env.IsDevelopment() ? ex.Message
                        : statusCode == StatusCodes.Status500InternalServerError
                            ? "Internal server error"
                        : ex.Message,
                    Details = env.IsDevelopment() ? ex.StackTrace : null,
                    TraceId = traceId,
                };

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
            }
        }
    }
}
