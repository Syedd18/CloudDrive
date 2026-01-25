import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'clouddrive-storage';
const SIGNED_URL_EXPIRATION = parseInt(
  process.env.SIGNED_URL_EXPIRATION || '3600'
);

export interface UploadOptions {
  userId: string;
  fileBuffer: Buffer;
  filename: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface S3FileInfo {
  s3Key: string;
  s3Url: string;
  bucket: string;
}

/**
 * Upload file to S3
 * Files are organized by user: {userId}/{uuid}-{filename}
 */
export async function uploadToS3({
  userId,
  fileBuffer,
  filename,
  mimeType,
  metadata = {},
}: UploadOptions): Promise<S3FileInfo> {
  try {
    // Generate unique S3 key with user folder structure
    const fileExtension = filename.split('.').pop();
    const uniqueId = uuidv4();
    const s3Key = `users/${userId}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        originalFilename: filename,
        userId,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
      // Server-side encryption
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    logger.info(`File uploaded to S3: ${s3Key}`);

    return {
      s3Key,
      s3Url,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
}

/**
 * Generate a signed URL for secure file download
 * URL expires after configured time (default: 1 hour)
 */
export async function getSignedDownloadUrl(s3Key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: SIGNED_URL_EXPIRATION,
    });

    logger.debug(`Generated signed URL for: ${s3Key}`);
    return signedUrl;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    logger.info(`File deleted from S3: ${s3Key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
}

/**
 * Check if file exists in S3
 */
export async function fileExistsInS3(s3Key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    logger.error('S3 file check error:', error);
    throw new Error('Failed to check file existence');
  }
}

/**
 * Get file metadata from S3
 */
export async function getS3FileMetadata(s3Key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    logger.error('Error getting S3 metadata:', error);
    throw new Error('Failed to get file metadata');
  }
}

/**
 * Copy file within S3 (useful for duplicating files)
 */
export async function copyFileInS3(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  try {
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(command);
    logger.info(`File copied in S3: ${sourceKey} -> ${destinationKey}`);
  } catch (error) {
    logger.error('S3 copy error:', error);
    throw new Error('Failed to copy file in cloud storage');
  }
}

export default s3Client;
