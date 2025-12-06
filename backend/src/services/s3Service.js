import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'pixels-official';
const S3_PREFIX = process.env.S3_PREFIX || 'invoices/';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} key - The S3 object key (path/filename)
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<{success: boolean, url: string, key: string}>}
 */
export const uploadToS3 = async (fileBuffer, key, contentType = 'application/pdf') => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
    
    console.log(`Uploaded to S3: ${key}`);
    return { success: true, url, key };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

/**
 * Get a signed URL for downloading a file from S3
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
export const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw error;
  }
};

/**
 * Generate invoice S3 key
 * @param {string} tenantId 
 * @param {string} invoiceNumber 
 * @returns {string}
 */
export const getInvoiceS3Key = (tenantId, invoiceNumber) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `${S3_PREFIX}${year}/${month}/${tenantId}/${invoiceNumber}.pdf`;
};

export default s3Client;
