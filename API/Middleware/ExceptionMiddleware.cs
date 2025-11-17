using System.Net;
using System.Text.Json;
using API.Errors;

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
                // We dont need any logic inside of the try block, we can just pass on the request to the next middleware here
                await next(context);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "{message}", exception.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = env.IsDevelopment()
                    ? new ApiException(
                        context.Response.StatusCode,
                        exception.Message,
                        exception.StackTrace
                    )
                    : new ApiException(
                        context.Response.StatusCode,
                        exception.Message,
                        "Internal server error"
                    );

                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                };

                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}
