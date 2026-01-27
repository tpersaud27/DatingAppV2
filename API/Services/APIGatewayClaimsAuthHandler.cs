using System.Security.Claims;
using System.Text.Encodings.Web;
using Amazon.Util.Internal;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class APIGatewayClaimsAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public APIGatewayClaimsAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder
        )
            : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Claims mapped from API Gateway parameter mapping
            var sub = Request.Headers["x-auth-sub"].ToString();

            if (string.IsNullOrWhiteSpace(sub))
                return Task.FromResult(AuthenticateResult.NoResult());

            var claims = new List<Claim> { new("sub", sub) };

            var email = Request.Headers["x-auth-email"].ToString();
            if (!string.IsNullOrWhiteSpace(email))
                claims.Add(new Claim(ClaimTypes.Email, email));

            var username = Request.Headers["x-auth-username"].ToString();
            if (!string.IsNullOrWhiteSpace(username))
                claims.Add(new Claim("cognito:username", username));

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
