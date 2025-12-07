// S3 storage computation utility
// Computes current storage usage for a tenant by listing objects in S3

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
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
      const params = {
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      };

      const response = await s3.listObjectsV2(params).promise();
      
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
export function getMaterialSignedUrl(tenantId, materialKey, expirySeconds = 3600) {
  try {
    const key = `tenants/${tenantId}/materials/${materialKey}`;
    const url = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: expirySeconds,
    });
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
    
    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    await s3.upload(params).promise();
    console.log(`Uploaded material: ${key}`);
    
    return key;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
}
