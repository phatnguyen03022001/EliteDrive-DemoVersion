import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { TripStatus, BookingStatus, UserRole, KYCStatus } from '@prisma/client';
import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';

// --- GROUP 1: PROFILE & KYC ---

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() avatar?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() licenseNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() licenseExpiry?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postalCode?: string;
}

export class CustomerProfileResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string | null;
  @ApiProperty() lastName: string | null;
  @ApiProperty() phone: string | null;
  @ApiProperty() avatar: string | null;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty() isActive: boolean;
  @ApiProperty() userCreatedAt: Date;
  @ApiProperty() userUpdatedAt: Date;
  @ApiProperty() profile: {
    id: string;
    licenseNumber: string | null;
    licenseExpiry: Date | null;
    avatar: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
    profileUpdatedAt: Date;
  } | null;
  @ApiProperty({ enum: KYCStatus, nullable: true }) kycStatus: KYCStatus | null;
}

export class CreateKYCDto {
  @ApiProperty() @IsNotEmpty() @IsString() documentType: string;
  @ApiProperty() @IsNotEmpty() @IsString() documentNumber: string;
  // @ApiProperty() @IsNotEmpty() @IsString() documentFrontUrl: string; // Đổi tên
  // @ApiProperty() @IsNotEmpty() @IsString() documentBackUrl: string; // Thêm mới
  // @ApiProperty() @IsNotEmpty() @IsString() faceImageUrl: string;
}

export class KYCStatusResponseDto {
  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

  // Thêm các trường này để trả về thông tin đã gửi
  @ApiProperty() @Optional() documentType?: string;
  @ApiProperty() @Optional() documentNumber?: string;
  @ApiProperty() @Optional() documentFrontUrl?: string;
  @ApiProperty() @Optional() documentBackUrl?: string;
  @ApiProperty() @Optional() faceImageUrl?: string;

  @ApiProperty() @Optional() rejectionReason?: string;
  @ApiProperty() @Optional() submittedAt?: Date | null; // Cho phép null nếu status là NONE
}

// --- GROUP 2: BOOKING & TRIPS ---

export class CreateBookingDto {
  @ApiProperty() @IsNotEmpty() @IsString() carId: string;
  @ApiProperty() @IsNotEmpty() @IsDateString() startDate: string;
  @ApiProperty() @IsNotEmpty() @IsDateString() endDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dropoffLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class BookingQueryDto {
  @IsOptional()
  @Type(() => Number) // Chuyển đổi String sang Number
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number) // Chuyển đổi String sang Number
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  status?: BookingStatus;
}

export class BookingDetailResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty({ enum: BookingStatus }) status: BookingStatus;
  @ApiProperty() totalPrice: number;
  @ApiProperty() car: { name: string; brand: string };
}

export class TripQueryDto {
  @ApiPropertyOptional({ enum: TripStatus })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}

export class TripStatusResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: TripStatus }) status: TripStatus;
  @ApiPropertyOptional() checkinTime?: Date;
  @ApiPropertyOptional() checkoutTime?: Date;
}

// --- GROUP 3: PAYMENT & CONTRACT ---

export class CreatePaymentDto {
  @ApiProperty() @IsString() bookingId: string;
  @ApiProperty() @IsString() paymentMethod: string;
}

export class ConfirmPaymentDto {
  @ApiProperty() @IsString() bookingId: string;
  @ApiProperty() @IsString() transactionId: string;
}

export class PaymentBookingParamDto {
  @ApiProperty() @IsString() booking_id: string;
}

export class SignContractDto {
  @ApiProperty({ description: 'Base64 hoặc URL chữ ký' })
  @IsNotEmpty()
  @IsString()
  signatureData: string;
}

export class ContractResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() bookingId: string;
  @ApiProperty() content: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() customerSignedAt?: Date;
}

// --- GROUP 4: WALLET & REVIEWS ---

export class WalletRefundDto {
  @ApiProperty() @IsNotEmpty() @IsString() bookingId: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() @Min(0) amount: number;
  @ApiProperty() @IsNotEmpty() @IsString() reason: string;
}

export class WalletTransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() amount: number;
  @ApiProperty({ description: 'CREDIT / DEBIT' }) type: string;
  @ApiProperty() description: string;
  @ApiProperty() createdAt: Date;
}

export class CreateReviewDto {
  @ApiProperty() @IsString() carId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bookingId?: string;
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
}

export class CreateWalletTopupDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  paymentMethod: string; // MOCK_QR | VNPAY | MOMO...

  @IsOptional()
  description?: string;
}

export class SearchCarQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
