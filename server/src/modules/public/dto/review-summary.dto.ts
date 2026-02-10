import { IsOptional, IsString } from 'class-validator';

export class ReviewSummaryDto {
  @IsOptional()
  @IsString()
  carId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
