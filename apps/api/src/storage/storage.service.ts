import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = configService.get('r2.bucketName');
    this.publicUrl = configService.get('r2.publicUrl');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${configService.get('r2.accountId')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configService.get('r2.accessKeyId'),
        secretAccessKey: configService.get('r2.secretAccessKey'),
      },
    });
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  generateKey(prefix: string, ext: string = 'jpg'): string {
    return `${prefix}/${uuidv4()}.${ext}`;
  }
}
