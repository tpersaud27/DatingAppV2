using Amazon.S3;
using Amazon.S3.Model;
using API.DTOs;
using API.Interfaces;

namespace API.Services
{
    /// <summary>
    /// Encapsulates all S3 interactions for photo upload & deletion.
    /// This service is intentionally thin and does NOT know about users or auth.
    /// </summary>
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;

        public S3Service(IAmazonS3 s3, IConfiguration config)
        {
            _s3Client = s3;

            // Bucket name is injected via configuration
            // In Lambda this comes from environment variables
            _bucketName = config["AWS:S3Bucket"];

            Console.WriteLine($"🪣 S3Service initialized. Bucket={_bucketName}");
        }

        /// <summary>
        /// Generates a pre-signed PUT URL that allows the client to upload directly to S3.
        /// This avoids sending large files through Lambda.
        /// </summary>
        public S3PhotoDTO.PresignResponse GeneratePresignedUrl(string fileName, string contentType)
        {
            if (string.IsNullOrWhiteSpace(_bucketName))
                throw new InvalidOperationException("S3 bucket name is not configured.");

            // Generate a unique S3 object key to avoid collisions
            // This is the *actual* S3 path where the file will live
            var key = $"profile-photos/{Guid.NewGuid()}-{fileName}";

            Console.WriteLine($"📸 Generating presigned URL");
            Console.WriteLine($"   Key={key}");
            Console.WriteLine($"   ContentType={contentType}");

            // Build the pre-signed URL request
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,

                // Short expiration for security
                Expires = DateTime.UtcNow.AddMinutes(10),

                // Client will upload using HTTP PUT
                Verb = HttpVerb.PUT,

                // Must match the Content-Type used by the browser
                ContentType = contentType,
            };

            // AWS SDK signs this URL using the Lambda execution role
            var uploadUrl = _s3Client.GetPreSignedURL(request);

            // This is the permanent, publicly accessible URL (if bucket allows reads)
            var fileUrl = $"https://{_bucketName}.s3.amazonaws.com/{key}";

            Console.WriteLine($"✅ Presigned URL generated");

            return new S3PhotoDTO.PresignResponse(uploadUrl, fileUrl);
        }

        /// <summary>
        /// Deletes an object from S3 by key.
        /// Used when users remove photos.
        /// </summary>
        public async Task DeletePhotoAsync(string s3Key)
        {
            if (string.IsNullOrWhiteSpace(_bucketName))
                throw new InvalidOperationException("S3 bucket name is not configured.");

            Console.WriteLine($"🗑️ Deleting S3 object");
            Console.WriteLine($"   Key={s3Key}");

            var request = new DeleteObjectRequest { BucketName = _bucketName, Key = s3Key };

            try
            {
                var response = await _s3Client.DeleteObjectAsync(request);
                Console.WriteLine($"✅ Delete succeeded. HTTP={response.HttpStatusCode}");
            }
            catch (AmazonS3Exception ex)
            {
                // These logs are CRITICAL for diagnosing IAM / VPC / KMS issues
                Console.WriteLine($"❌ S3 delete failed");
                Console.WriteLine($"   StatusCode={ex.StatusCode}");
                Console.WriteLine($"   ErrorCode={ex.ErrorCode}");
                Console.WriteLine($"   Message={ex.Message}");
                throw;
            }
        }
    }
}
