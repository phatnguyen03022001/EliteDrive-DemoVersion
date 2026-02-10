// src/modules/customer/customer.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiResponse,
  PaginatedResponseDto,
} from '../../common/dto/response.dto';
import * as address from 'address';

import {
  // Profile & KYC
  UpdateCustomerProfileDto,
  CustomerProfileResponseDto,
  CreateKYCDto,
  KYCStatusResponseDto,

  // Booking & Trips
  CreateBookingDto,
  BookingQueryDto,
  BookingDetailResponseDto,
  TripQueryDto,
  TripStatusResponseDto,

  // Payment
  CreatePaymentDto,
  ConfirmPaymentDto,
  // PaymentBookingParamDto,

  // Contract
  SignContractDto,
  ContractResponseDto,

  // Wallet & Review
  // WalletRefundDto,
  WalletTransactionResponseDto,
  CreateReviewDto,
  CreateWalletTopupDto,
  SearchCarQueryDto,
} from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.ADMIN)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Profile
  @Get('profile')
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<CustomerProfileResponseDto>> {
    const profile = await this.customerService.getProfile(userId);
    return ApiResponse.success(profile);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCustomerProfileDto,
    @UploadedFile() avatarFile?: Express.Multer.File, // Đổi tên biến cho rõ ràng
  ): Promise<ApiResponse<CustomerProfileResponseDto>> {
    // Style giống KYC: Truyền userId, dto, và file vào service
    const updated = await this.customerService.updateProfile(
      userId,
      dto,
      avatarFile,
    );
    return ApiResponse.success(updated, 'Cập nhật thành công');
  }

  // KYC
  @Post('kyc')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documentFront', maxCount: 1 }, // Đổi từ documentImage thành documentFront
      { name: 'documentBack', maxCount: 1 }, // Thêm field cho mặt sau
      { name: 'faceImage', maxCount: 1 },
    ]),
  )
  async submitKyc(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKYCDto,
    @UploadedFiles()
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
  ): Promise<ApiResponse<any>> {
    // Bây giờ files đã có đủ front, back, face để truyền vào service
    const kyc = await this.customerService.submitKyc(userId, dto, files);
    return ApiResponse.success(kyc, 'Đã gửi KYC thành công');
  }

  @Get('kyc/status')
  async getKycStatus(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<KYCStatusResponseDto>> {
    const status = await this.customerService.getKycStatus(userId);
    return ApiResponse.success(status);
  }

  // Bookings
  @Post('bookings')
  async createBooking(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<ApiResponse<any>> {
    const booking = await this.customerService.createBooking(userId, dto);
    return ApiResponse.success(booking, 'Đặt xe thành công');
  }

  @Get('bookings')
  async getBookings(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto & BookingQueryDto,
  ): Promise<PaginatedResponseDto<BookingDetailResponseDto>> {
    const { data, total, page, limit } = await this.customerService.getBookings(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Get('bookings/:booking_id')
  async getBookingDetail(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
  ): Promise<ApiResponse<BookingDetailResponseDto>> {
    const booking = await this.customerService.getBookingDetail(
      userId,
      bookingId,
    );
    return ApiResponse.success(booking);
  }

  @Put('bookings/:booking_id/cancel')
  async cancelBooking(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.customerService.cancelBooking(userId, bookingId);
    return ApiResponse.success(result, 'Hủy đặt xe thành công');
  }

  // Payments
  @Post('payments/create')
  async createPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ): Promise<ApiResponse<any>> {
    const payment = await this.customerService.createPayment(userId, dto);

    // Gắn thêm link QR Mock (trỏ về địa chỉ IP local của máy tính bạn)
    // Ví dụ: http://192.168.1.10:3000/api/customer/payments/mock-scan/PAYMENT_ID
    const localIp = address.ip(); // Thay bằng IP máy bạn
    const mockQrUrl = `http://${localIp}:${process.env.APP_PORT}/api/customer/payments/mock-scan/${payment.id}`;

    return ApiResponse.success(
      { ...payment, mockQrUrl },
      'Tạo thanh toán thành công. Hãy quét mã QR để hoàn tất.',
    );
  }

  @Public()
  @Get('payments/mock-scan/:payment_id')
  async mockScanPayment(
    @Param('payment_id') paymentId: string,
  ): Promise<string> {
    // CHỈ truyền paymentId vào đây
    await this.customerService.confirmPaymentByQr(paymentId);
    return `<h1>Thanh toán thành công</h1>`;
  }

  @Post('payments/confirm')
  async confirmPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<ApiResponse<any>> {
    // Gọi hàm confirmPayment (có 2 tham số: userId và dto)
    const result = await this.customerService.confirmPayment(userId, dto);
    return ApiResponse.success(result, 'Xác nhận thanh toán thành công');
  }
  @Get('payments/:booking_id')
  async getPaymentByBooking(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
  ): Promise<ApiResponse<any>> {
    const payment = await this.customerService.getPaymentByBooking(
      userId,
      bookingId,
    );
    return ApiResponse.success(payment);
  }

  // Trips
  @Get('trips')
  async getTrips(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto & TripQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { data, total, page, limit } = await this.customerService.getTrips(
      userId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Get('trips/:trip_id/status')
  async getTripStatus(
    @CurrentUser('id') userId: string,
    @Param('trip_id') tripId: string,
  ): Promise<ApiResponse<TripStatusResponseDto>> {
    const status = await this.customerService.getTripStatus(userId, tripId);
    return ApiResponse.success(status);
  }

  // Contracts
  @Get('contracts/:booking_id')
  async getContract(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
  ): Promise<ApiResponse<ContractResponseDto>> {
    const contract = await this.customerService.getContract(userId, bookingId);
    return ApiResponse.success(contract);
  }

  @Post('contracts/:booking_id/sign')
  async signContract(
    @CurrentUser('id') userId: string,
    @Param('booking_id') bookingId: string,
    @Body() dto: SignContractDto,
  ): Promise<ApiResponse<ContractResponseDto>> {
    const signed = await this.customerService.signContract(
      userId,
      bookingId,
      dto,
    );
    return ApiResponse.success(signed, 'Ký hợp đồng thành công');
  }

  // Wallet
  @Get('wallet')
  async getWallet(
    @CurrentUser('id') userId: string,
  ): Promise<ApiResponse<any>> {
    const wallet = await this.customerService.getWallet(userId);
    return ApiResponse.success(wallet);
  }

  @Get('wallet/transactions')
  async getWalletTransactions(
    @CurrentUser('id') userId: string,
  ): Promise<PaginatedResponseDto<WalletTransactionResponseDto>> {
    const { data, total, page, limit } =
      await this.customerService.getWalletTransactions(userId);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  // POST /api/customer/wallet/topup
  @Post('wallet/topup')
  async topupWallet(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWalletTopupDto,
  ): Promise<ApiResponse<any>> {
    const payment = await this.customerService.createWalletTopup(userId, dto);

    const localIp = address.ip();
    const mockQrUrl = `http://${localIp}:${process.env.APP_PORT}/api/customer/wallet/topup/mock-scan/${payment.id}`;

    return ApiResponse.success(
      { ...payment, mockQrUrl },
      'Tạo yêu cầu nạp tiền thành công',
    );
  }

  // Reviews
  @Post('reviews')
  async createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ApiResponse<any>> {
    const review = await this.customerService.createReview(userId, dto);
    return ApiResponse.success(review, 'Đánh giá đã gửi');
  }

  @Get('reviews/my')
  async getMyReviews(
    @CurrentUser('id') userId: string,
    @Query() query?: PaginationDto & any,
  ): Promise<PaginatedResponseDto<any>> {
    const { data, total, page, limit } =
      await this.customerService.getMyReviews(userId, query);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Public()
  @Get('wallet/topup/mock-scan/:payment_id')
  async mockScanWalletTopup(@Param('payment_id') paymentId: string) {
    await this.customerService.confirmWalletTopup(paymentId);
    return `<h1>Nạp tiền thành công</h1>`;
  }

  // Cars search
  @Get('/cars/search')
  @Public()
  async searchCars(@Query() query: SearchCarQueryDto) {
    return this.customerService.searchCars(query);
  }
  // Booking price preview
  @Get('bookings/:id/price-preview')
  async previewPrice(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.customerService.previewBookingPrice(userId, bookingId);
  }

  // Confirm booking (sau payment + contract)
  @Post('bookings/:id/confirm')
  async confirmBooking(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ) {
    return this.customerService.confirmBooking(userId, bookingId);
  }

  // Dispute
  @Post('disputes')
  async createDispute(
    @CurrentUser('id') userId: string,
    @Body()
    dto: {
      type: string;
      bookingId?: string;
      description: string;
      title: string;
    },
  ) {
    // Chúng ta gộp 'type' vào 'title' hoặc xử lý tùy biến
    const result = await this.customerService.createDispute(userId, dto);
    return ApiResponse.success(result, 'Yêu cầu hỗ trợ đã được gửi thành công');
  }

  @Get('disputes')
  async getMyDisputes(@CurrentUser('id') userId: string) {
    const data = await this.customerService.getMyDisputes(userId);
    return ApiResponse.success(data);
  }

  @Get('promotions')
  @Public()
  async getActivePromotions(): Promise<ApiResponse<any>> {
    const promotions = await this.customerService.getActivePromotions();
    return ApiResponse.success(promotions);
  }

  @Post('promotions/apply')
  async applyPromotion(
    @CurrentUser('id') userId: string,
    @Body() dto: { bookingId: string; promoCode: string },
  ): Promise<ApiResponse<any>> {
    const result = await this.customerService.applyPromotion(
      userId,
      dto.bookingId,
      dto.promoCode,
    );
    return ApiResponse.success(result, 'Áp dụng mã khuyến mãi thành công');
  }
}
