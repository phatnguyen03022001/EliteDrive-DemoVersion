import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { DisputeStatus, UserRole } from '@prisma/client';
import { ApiResponse } from '../../common/dto/response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  // Reports
  ReportDateRangeDto,
  // Promotions
  CreatePromotionDto,
  PromotionQueryDto,
  UpdatePromotionDto,
  // Payments & Settlements
  PaymentQueryDto,
  RunSettlementDto,
  SettlementHistoryQueryDto,
  // KYC
  AdminKYCQueryDto,
  RejectKYCDto,
  // Master Data
  CreateCategoryDto,
  CreateLocationDto,
  // Disputes

  // Cars
} from './dto/admin.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CustomerProfileResponseDto,
  UpdateCustomerProfileDto,
} from '../customer/dto/customer.dto';

@Controller('api/admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  customerService: any;
  constructor(private readonly adminService: AdminService) {}

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

  // ===========================================================================
  // 1. REPORTS & ANALYTICS
  // ===========================================================================

  @Get('reports/overview')
  async getOverviewReport() {
    const overview = await this.adminService.getOverviewReport();
    return ApiResponse.success(overview);
  }

  @Get('reports/bookings')
  async getBookingsReport(@Query() query: ReportDateRangeDto) {
    const report = await this.adminService.getBookingsReport(query);
    return ApiResponse.success(report);
  }

  @Get('reports/revenue')
  async getRevenueReport(@Query() query: ReportDateRangeDto) {
    const revenue = await this.adminService.getRevenueReport(query);
    return ApiResponse.success(revenue);
  }

  // ===========================================================================
  // 2. CAR MANAGEMENT
  // ===========================================================================

  @Get('cars/pending')
  async getPendingCars() {
    const cars = await this.adminService.getPendingCars();
    return ApiResponse.success(cars);
  }

  @Post('cars/:car_id/approve')
  async approveCar(@Param('car_id') carId: string) {
    await this.adminService.approveCar(carId);
    return ApiResponse.success(null, 'Xe đã được phê duyệt');
  }

  @Get('cars/all')
  async getAllCars(@Query('status') status?: string) {
    // Ép kiểu hoặc validate status dựa trên Enum CarStatus nếu cần
    const cars = await this.adminService.getAllCars(status);
    return ApiResponse.success(cars);
  }

  @Post('cars/:car_id/reject')
  async rejectCar(
    @Param('car_id') carId: string,
    @Body('reason') reason: string, // Nhận reason từ RejectCarDialog gửi lên
  ) {
    await this.adminService.rejectCar(carId, reason);
    return ApiResponse.success(null, 'Đã từ chối phê duyệt xe');
  }

  // ===========================================================================
  // 3. KYC CUSTOMERS
  // ===========================================================================

  @Get('kyc/customers')
  async getKycCustomers(@Query() query: PaginationDto & AdminKYCQueryDto) {
    const result = await this.adminService.getKycCustomers(query);
    return ApiResponse.success(result);
  }

  @Post('kyc/customers/:user_id/approve')
  async approveKyc(@Param('user_id') userId: string) {
    await this.adminService.approveKyc(userId);
    return ApiResponse.success(null, 'KYC đã được phê duyệt');
  }

  @Post('kyc/customers/:user_id/reject')
  async rejectKyc(@Param('user_id') userId: string, @Body() dto: RejectKYCDto) {
    await this.adminService.rejectKyc(userId, dto);
    return ApiResponse.success(null, 'KYC đã bị từ chối');
  }

  // ===========================================================================
  // 4. PROMOTIONS
  // ===========================================================================

  @Post('promotions')
  async createPromotion(@Body() dto: CreatePromotionDto) {
    const promotion = await this.adminService.createPromotion(dto);
    return ApiResponse.success(promotion, 'Khuyến mãi đã tạo');
  }

  @Patch('promotions/:id')
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    const updated = await this.adminService.updatePromotion(id, dto);
    return ApiResponse.success(updated, 'Khuyến mãi đã cập nhật');
  }

  @Get('promotions')
  async getPromotions(@Query() query: PromotionQueryDto) {
    const promotions = await this.adminService.getPromotions(query);
    return ApiResponse.success(promotions);
  }

  // ===========================================================================
  // 5. PAYMENTS & SETTLEMENTS
  // ===========================================================================

  @Get('payments')
  async getPayments(@Query() query: PaginationDto & PaymentQueryDto) {
    const payments = await this.adminService.getPayments(query);
    return ApiResponse.success(payments);
  }

  @Post('settlements/run')
  async runSettlement(@Body() dto: RunSettlementDto) {
    const settlement = await this.adminService.runSettlement(dto);
    return ApiResponse.success(settlement, 'Settlement đã chạy');
  }

  @Get('settlements/history')
  async getSettlementHistory(
    @Query() query: PaginationDto & SettlementHistoryQueryDto,
  ) {
    const history = await this.adminService.getSettlementHistory(query);
    return ApiResponse.success(history);
  }

  // ===========================================================================
  // 6. DISPUTES
  // ===========================================================================

  @Get('disputes')
  @Roles(UserRole.ADMIN)
  async getAll(@Query() query: PaginationDto) {
    return this.adminService.getAllDisputes(query);
  }

  // API xác nhận bắt đầu xử lý
  @Patch('disputes/:id/process')
  @Roles(UserRole.ADMIN)
  async startProcessing(@Param('id') id: string) {
    return this.adminService.updateToInProgress(id);
  }

  // API đóng/hoàn tất khiếu nại
  @Post('disputes/:id/resolve')
  @Roles(UserRole.ADMIN)
  async resolve(
    @Param('id') id: string,
    @Body() dto: { resolution: string; status: DisputeStatus },
  ) {
    return this.adminService.resolveDispute(id, dto);
  }

  // ===========================================================================
  // 7. MASTER DATA
  // ===========================================================================

  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.adminService.createCategory(dto);
    return ApiResponse.success(category, 'Danh mục đã tạo');
  }

  @Post('locations')
  async createLocation(@Body() dto: CreateLocationDto) {
    const location = await this.adminService.createLocation(dto);
    return ApiResponse.success(location, 'Địa điểm đã tạo');
  }

  @Post('payments/release')
  async releasePayment(
    @Body()
    dto: {
      bookingId: string;
      platformFeePercent?: number;
    },
  ) {
    const result = await this.adminService.releasePayment(dto);
    return ApiResponse.success(
      result,
      `Đã chuyển ${result.ownerReceived} VND cho owner`,
    );
  }

  @Post('payments/refund')
  async refundPayment(
    @Body()
    dto: {
      bookingId: string;
      refundPercent?: number;
      reason: string;
    },
  ) {
    const result = await this.adminService.refundPayment(dto);
    return ApiResponse.success(
      result,
      `Đã hoàn ${result.refundAmount} VND cho khách`,
    );
  }

  // ================= PLATFORM WALLET =================

  @Get('wallets/platform')
  async getPlatformWallet() {
    return ApiResponse.success(await this.adminService.getPlatformWallet());
  }

  // ================= GLOBAL LIST =================

  @Get('bookings/all')
  async getAllBookings(@Query() query: PaginationDto) {
    return ApiResponse.success(await this.adminService.getAllBookings(query));
  }

  @Get('contracts/all')
  async getAllContracts(@Query() query: PaginationDto) {
    return ApiResponse.success(await this.adminService.getAllContracts(query));
  }

  // ================= USERS =================

  @Get('users')
  async getUsers(@Query() query: PaginationDto) {
    return ApiResponse.success(await this.adminService.getUsers(query));
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE',
  ) {
    const isActive = status === 'ACTIVE';
    await this.adminService.updateUserStatus(userId, isActive);
    return ApiResponse.success(null, 'Trạng thái user đã cập nhật');
  }

  // ================= AUDIT =================

  @Get('escrow/pending-release')
  async getPendingReleaseTrips(@Query() query: PaginationDto) {
    const result = await this.adminService.getPendingReleaseTrips(query);
    return ApiResponse.success(result);
  }

  // ================= WITHDRAW MANAGEMENT =================
  @Get('withdraws/pending')
  async getPendingWithdraws(@Query() query: PaginationDto) {
    const result = await this.adminService.getPendingWithdraws(query);
    return ApiResponse.success(result);
  }

  @Post('withdraws/:id/approve')
  async approveWithdraw(@Param('id') id: string) {
    await this.adminService.approveWithdraw(id);
    return ApiResponse.success(null, 'Đã duyệt rút tiền');
  }

  @Post('withdraws/:id/reject')
  async rejectWithdraw(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    await this.adminService.rejectWithdraw(id, reason);
    return ApiResponse.success(null, 'Đã từ chối rút tiền');
  }

  // ================= AUTO OPERATIONS =================
  @Post('settlements/auto-release')
  async autoReleasePayments() {
    const result = await this.adminService.autoReleaseCompletedTrips();
    return ApiResponse.success(
      result,
      `Đã release ${result.processed} payments`,
    );
  }
}
