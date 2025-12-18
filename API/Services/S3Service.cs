using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using API.DTOs;
using API.Interfaces;

namespace API.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string? _bucketName;

        public S3Service(IAmazonS3 s3, IConfiguration config)
        {
            _s3Client = s3;
            _bucketName = config["AWS:S3Bucket"];
        }

        public S3PhotoDTO.PresignResponse GeneratePresignedUrl(string fileName, string contentType)
        {
            // Generate unique S3 object key
            // This determines where the file will live in S3
            var key = $"profile-photos/{Guid.NewGuid()}-{fileName}";

            // Building the pre-signed URL request
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Expires = DateTime.UtcNow.AddMinutes(10),
                Verb = HttpVerb.PUT,
                ContentType = contentType,
            };

            // Generate the signed upload URL
            // AWS will cryptographically sign this URL so that only someone with the URL can upload the file
            var uploadUrl = _s3Client.GetPreSignedURL(request);

            // Building the permnanent file URL
            var fileUrl = $"https://{_bucketName}.s3.amazonaws.com/{key}";

            return new S3PhotoDTO.PresignResponse(uploadUrl, fileUrl);
        }
    }
}
