import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../config/logger';

const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const bucket = process.env.MINIO_BUCKET || 'pbl-bucket';
const region = process.env.MINIO_REGION || 'us-east-1';

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
  }
});

export class StorageService {
  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    });

    await client.send(command);
    logger.info('File uploaded to MinIO', { key, bucket });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await client.send(command);
    logger.info('File deleted from MinIO', { key, bucket });
  }

  async getPresignedUrl(key: string, expiresIn: number = 300): Promise<string> {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  }
}

export const storageService = new StorageService();