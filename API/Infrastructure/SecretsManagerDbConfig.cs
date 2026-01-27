using System.Text.Json;
using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

namespace API.Infrastructure
{
    public class SecretsManagerDbConfig
    {
        public static async Task<string> GetConnectionStringAsync(
            string secretId,
            string region,
            CancellationToken ct = default
        )
        {
            var client = new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(region));

            var resp = await client.GetSecretValueAsync(
                new GetSecretValueRequest { SecretId = secretId },
                ct
            );

            if (string.IsNullOrWhiteSpace(resp.SecretString))
                throw new InvalidOperationException($"Secret '{secretId}' has no SecretString.");

            // SecretString is JSON
            // Example JSON:
            // { "host":"...", "port":5432, "database":"dating-app-v2", "username":"appuser", "password":"...", "sslMode":"Require" }
            var doc = JsonDocument.Parse(resp.SecretString);
            var root = doc.RootElement;

            string host = root.GetProperty("host").GetString()!;
            int port = root.TryGetProperty("port", out var p) ? p.GetInt32() : 5432;
            string database = root.GetProperty("database").GetString()!;
            string username = root.GetProperty("username").GetString()!;
            string password = root.GetProperty("password").GetString()!;
            string sslMode = root.TryGetProperty("sslMode", out var s) ? s.GetString()! : "Require";

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate=true";
        }
    }
}
