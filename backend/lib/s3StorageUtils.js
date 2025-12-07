// S3 storage computation utility
// Computes current storage usage for a tenant by listing objects in S3

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'enromatics-materials';

/**
 * Compute total storage usage (in GB) for a tenant
 * Lists all objects under tenant prefix and sums sizes
 */
export async function computeTenantStorageGB(tenantId) {
  try {
    const prefix = `tenants/${tenantId}/materials/`; // S3 prefix for tenant materials
    
    let totalBytes = 0;
    let continuationToken = null;

    // Paginate through objects (max 1000 per request)
    do {
      const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await s3.send(command);
      
      if (response.Contents) {
        response.Contents.forEach(obj => {
          totalBytes += obj.Size || 0;
        });
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Convert bytes to GB
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    console.log(`Tenant ${tenantId} storage: ${totalGB.toFixed(2)} GB`);
    
    return Math.round(totalGB * 100) / 100; // Round to 2 decimals
  } catch (err) {
    console.error(`Error computing storage for tenant ${tenantId}:`, err);
    // Return 0 on error (soft fail; don't block operations)
    return 0;
  }
}

/**
 * Get object URL for a material (for download/streaming)
 * Signs URL with 1-hour expiry
 */
export async function getMaterialSignedUrl(tenantId, materialKey, expirySeconds = 3600) {
  try {
    const key = `tenants/${tenantId}/materials/${materialKey}`;
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: expirySeconds });
    return url;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
}

/**
 * Upload material to S3
 * Returns the S3 key for storage in DB
 */
export async function uploadMaterialToS3(tenantId, fileName, fileBuffer, contentType) {
  try {
    const key = `tenants/${tenantId}/materials/${Date.now()}_${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3.send(command);
    console.log(`Uploaded material: ${key}`);
    
    return key;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
}
