import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUrl,
  IsEnum,
  Min,
} from 'class-validator';
import { BookingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { Optional } from '@nestjs/common';

// --- GROUP 1: CAR MANAGEMENT ---

export class CreateKYCDto {
  @ApiProperty() @IsNotEmpty() @IsString() documentType: string;
  @ApiProperty() @IsNotEmpty() @IsString() documentNumber: string;
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

export class CreateCarDto {
  @ApiProperty({ example: 'VinFast VF8' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'VinFast' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Plus' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Type(() => Number) // Convert từ string sang number
  year: number;

  @ApiProperty({ example: '51H-123.45' })
  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @ApiPropertyOptional({ example: 'Trắng' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'Automatic' })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({ example: 'Electric' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Type(() => Number)
  seatCount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1000000 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pricePerDay: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pricePerHour?: number;

  // THÊM 2 DÒNG NÀY VÀO:
  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pricePerWeek?: number;

  @ApiPropertyOptional({ example: 15000000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pricePerMonth?: number;

  @ApiPropertyOptional({ description: 'ID danh mục xe' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID vị trí xe' })
  @IsOptional()
  @IsString()
  locationId?: string;
}

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
}

export class CreateCarDocumentDto {
  @ApiProperty({ description: 'Ví dụ: Bảo hiểm, Đăng kiểm' })
  @IsNotEmpty()
  @IsString()
  documentType: string;
  @ApiProperty() @IsNotEmpty() @IsUrl() documentUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
}

export class CarDocumentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() carId: string;
  @ApiProperty() documentType: string;
  @ApiProperty() documentUrl: string;
  @ApiProperty() expiryDate: Date | null;
  @ApiProperty() uploadedAt: Date;
}

// --- GROUP 2: PRICING & CALENDAR ---

export class CreatePricingDto {
  @ApiProperty() @IsNotEmpty() @IsNumber() @Min(0) pricePerDay: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pricePerHour?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pricePerWeek?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pricePerMonth?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() discountPercentage?: number;
  @ApiProperty() @IsNotEmpty() @IsDateString() effectiveFrom: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveTo?: string;
}

export class BlockCalendarDto {
  @ApiProperty({ example: '2026-02-14' })
  @IsNotEmpty()
  @IsDateString()
  date: string;
  @ApiPropertyOptional() @IsOptional() @IsString() blockedReason?: string;
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}

export class GetCalendarDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class CalendarResponseDto {
  @ApiProperty() date: Date;
  @ApiProperty() isBlocked: boolean;
  @ApiProperty() blockedReason: string | null;
}

// --- GROUP 3: TRIP OPERATIONS (CHECKIN/OUT) ---

export class TripCheckinDto {
  @ApiProperty() @IsNumber() @Min(0) startOdometer: number;
  @ApiProperty({ description: 'Phần trăm pin hoặc vạch xăng' })
  @IsNumber()
  startFuelLevel: number;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupNotes?: string;
}

export class TripCheckoutDto {
  @ApiProperty() @IsNumber() @Min(0) endOdometer: number;
  @ApiProperty() @IsNumber() endFuelLevel: number;
  @ApiPropertyOptional() @IsOptional() @IsString() dropoffNotes?: string;
}

export class OwnerBookingQueryDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

export class RejectBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

// --- GROUP 4: FINANCE & EARNINGS ---

export class WithdrawRequestDto {
  @ApiProperty({ example: 500000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(50000)
  amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class EarningResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() bookingId: string | null;
  @ApiProperty() amount: number;
  @ApiProperty({ description: 'RENTAL_INCOME, COMPENSATION' }) type: string;
  @ApiProperty() createdAt: Date;
}

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() amount: number;
  @ApiProperty({ description: 'WITHDRAWAL, EARNING' }) type: string;
  @ApiProperty({ description: 'PENDING, COMPLETED, FAILED' }) status: string;
  @ApiProperty() createdAt: Date;
}

export class UpdateOwnerProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() taxId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
}

export class OwnerProfileResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() companyName: string | null;
  @ApiProperty() taxId: string | null;
  @ApiProperty() bankAccountName: string | null;
  @ApiProperty() bankAccountNumber: string | null;
  @ApiProperty() bankCode: string | null;
  @ApiProperty() address: string | null;
  @ApiProperty() city: string | null;
  @ApiProperty() country: string | null;
  @ApiProperty() verificationStatus: string;
  @ApiProperty() user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
}
