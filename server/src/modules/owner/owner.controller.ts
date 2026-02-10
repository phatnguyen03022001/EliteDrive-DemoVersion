import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

import {
  ApiResponse,
  PaginatedResponseDto,
} from '../../common/dto/response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  CreateCarDto,
  UpdateCarDto,
  CreateCarDocumentDto,
  CarDocumentResponseDto,
  CreatePricingDto,
  BlockCalendarDto,
  // CalendarResponseDto,
  OwnerBookingQueryDto,
  RejectBookingDto,
  WithdrawRequestDto,
  TripCheckinDto,
  TripCheckoutDto,
  GetCalendarDto,
  CreateKYCDto,
  KYCStatusResponseDto,
} from './dto/owner.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}
  // 1. CAR MANAGEMENT

  @Post('kyc')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documentFront', maxCount: 1 },
      { name: 'documentBack', maxCount: 1 },
      { name: 'faceImage', maxCount: 1 },
    ]),
  )
  async submitOwnerKyc(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKYCDto,
    @UploadedFiles()
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
  ): Promise<ApiResponse<any>> {
    // Gọi sang ownerService thay vì customerService
    const kyc = await this.ownerService.submitKyc(userId, dto, files);
    return ApiResponse.success(kyc, 'Hồ sơ KYC chủ xe đã được gửi thành công');
  }

  @Get('kyc/status')
  async getOwnerKycStatus(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<KYCStatusResponseDto>> {
    const status = await this.ownerService.getKycStatus(userId);
    return ApiResponse.success(status);
  }

  @Post('cars')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 }, // Bắt buộc 1
      { name: 'images', maxCount: 3 }, // Tối đa 3 ảnh phụ
    ]),
  )
  async createCar(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCarDto,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.ownerService.createCar(userId, dto, files);
  }

  @Get('cars')
  async getMyCars(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationDto,
  ) {
    const { data, total, page, limit } = await this.ownerService.getMyCars(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Put('cars/:car_id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
  )
  async updateCar(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
    @Body() dto: UpdateCarDto,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.ownerService.updateCar(userId, carId, dto, files);
  }

  @Delete('cars/:car_id')
  async deleteCar(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
  ) {
    await this.ownerService.deleteCar(userId, carId);
    return ApiResponse.success(null, 'Xe đã xóa');
  }

  // 2. DOCUMENTS, PRICING & CALENDAR

  @Post('cars/:car_id/documents')
  async addCarDocument(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
    @Body() dto: CreateCarDocumentDto,
  ) {
    const doc = await this.ownerService.addCarDocument(userId, carId, dto);
    return ApiResponse.success(doc, 'Tài liệu đã thêm');
  }

  @Get('cars/:car_id/documents')
  async getCarDocuments(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
  ): Promise<ApiResponse<CarDocumentResponseDto[]>> {
    const docs = await this.ownerService.getCarDocuments(userId, carId);
    return ApiResponse.success(docs);
  }

  @Post('cars/:car_id/pricing')
  async addPricing(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
    @Body() dto: CreatePricingDto,
  ) {
    const pricing = await this.ownerService.updateCarPricing(
      userId,
      carId,
      dto,
    );
    return ApiResponse.success(pricing, 'Bảng giá đã thêm');
  }

  @Post('cars/:car_id/calendar/block')
  async blockCalendar(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
    @Body() dto: BlockCalendarDto,
  ) {
    const result = await this.ownerService.blockAvailability(
      userId,
      carId,
      dto,
    );
    return ApiResponse.success(result, 'Lịch đã cập nhật');
  }

  @Get('cars/:car_id/calendar')
  async getCalendar(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
    @Query() query: GetCalendarDto,
  ) {
    const start = query.start_date ? new Date(query.start_date) : new Date();
    const end = query.end_date
      ? new Date(query.end_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Sửa getCalendar -> getAvailability
    const calendar = await this.ownerService.getAvailability(
      userId,
      carId,
      start,
      end,
    );
    return ApiResponse.success(calendar);
  }

  // 3. BOOKING MANAGEMENT
  @Get('bookings')
  async getBookings(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto & OwnerBookingQueryDto,
  ) {
    const { data, total, page, limit } = await this.ownerService.getBookings(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Post('bookings/:booking_id/approve')
  async approveBooking(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
  ) {
    const booking = await this.ownerService.approveBooking(userId, bookingId);
    return ApiResponse.success(booking, 'Đã phê duyệt đặt xe');
  }

  @Post('bookings/:booking_id/reject')
  async rejectBooking(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
    @Body() dto: RejectBookingDto,
  ) {
    const booking = await this.ownerService.rejectBooking(
      userId,
      bookingId,
      dto,
    );
    return ApiResponse.success(booking, 'Đã từ chối đặt xe');
  }

  // 4. FINANCE & WITHDRAWAL

  @Get('finance/earnings')
  async getEarnings(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationDto,
  ) {
    const { data, total, page, limit } = await this.ownerService.getEarnings(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Get('finance/transactions')
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationDto,
  ) {
    const { data, total, page, limit } =
      await this.ownerService.getOwnerTransactions(userId, query);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Post('finance/withdraw')
  async requestWithdraw(
    @CurrentUser('id') userId: string,
    @Body() dto: WithdrawRequestDto,
  ) {
    const withdraw = await this.ownerService.requestWithdraw(userId, dto);
    return ApiResponse.success(withdraw, 'Yêu cầu rút tiền đã gửi');
  }

  @Get('dashboard/overview')
  async getOverview(@CurrentUser('id') userId: string) {
    const data = await this.ownerService.getDashboardOverview(userId);
    return ApiResponse.success(data);
  }

  // SUBMIT CAR FOR REVIEW
  @Post('cars/:car_id/submit-review')
  async submitCarReview(
    @CurrentUser('id') userId: string,
    @Param('car_id') carId: string,
  ) {
    const car = await this.ownerService.submitCarForReview(userId, carId);
    return ApiResponse.success(car, 'Đã gửi xe chờ duyệt');
  }

  // WALLET
  @Get('wallet')
  async getWallet(@CurrentUser('id') userId: string) {
    const wallet = await this.ownerService.getWallet(userId);
    return ApiResponse.success(wallet);
  }

  // DISPUTE RESPOND
  @Post('disputes/:dispute_id/respond')
  async respondDispute(
    @CurrentUser('id') userId: string,
    @Param('dispute_id') disputeId: string,
    @Body('message') message: string,
  ) {
    const dispute = await this.ownerService.respondDispute(
      userId,
      disputeId,
      message,
    );
    return ApiResponse.success(dispute, 'Đã phản hồi tranh chấp');
  }

  // TRIPS
  @Get('trips')
  async getTrips(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationDto,
  ) {
    const { data, total, page, limit } = await this.ownerService.getTrips(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Post('trips/:trip_id/checkin')
  async checkinTrip(
    @CurrentUser('id') userId: string,
    @Param('trip_id') tripId: string,
    @Body() dto: TripCheckinDto,
  ) {
    const trip = await this.ownerService.checkinTrip(userId, tripId, dto);
    return ApiResponse.success(trip, 'Đã check-in thành công');
  }

  @Post('trips/:trip_id/checkout')
  async checkoutTrip(
    @CurrentUser('id') userId: string,
    @Param('trip_id') tripId: string,
    @Body() dto: TripCheckoutDto,
  ) {
    const trip = await this.ownerService.checkoutTrip(userId, tripId, dto);
    return ApiResponse.success(trip, 'Đã check-out thành công');
  }
}
