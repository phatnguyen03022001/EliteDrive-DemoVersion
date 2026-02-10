import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

/**
 * Thường dùng để lưu trữ metadata sau khi file đã được upload lên
 * các dịch vụ như S3, Cloudinary hoặc local storage.
 */
export class FileUploadDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @IsOptional()
  @IsString()
  uploadedBy?: string; // userId của người upload
}

export class FileUploadResponseDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}
