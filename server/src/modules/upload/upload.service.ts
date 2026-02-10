import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'), // http://127.0.0.1:9000
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'S3_SECRET_ACCESS_KEY',
        )!,
      },
      // QUAN TRỌNG VỚI MINIO:
      forcePathStyle: true,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    if (!file) throw new BadRequestException('File không hợp lệ');

    // Làm sạch tên file để tránh lỗi ký tự đặc biệt trong Signature
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileKey = `${folder}/${Date.now()}-${cleanFileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Bỏ ACL vì MinIO mặc định quản lý qua Policy
        }),
      );

      return `${this.configService.get('S3_ENDPOINT')}/${this.bucketName}/${fileKey}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException(
        'Không thể upload file lên hệ thống lưu trữ',
      );
    }
  }
}
