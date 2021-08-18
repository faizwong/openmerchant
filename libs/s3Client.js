const S3Client = require('@aws-sdk/client-s3').S3Client;

const region = process.env.AWS_BUCKET_REGION;

const s3Client = new S3Client({ region: region });

module.exports =  { s3Client };
