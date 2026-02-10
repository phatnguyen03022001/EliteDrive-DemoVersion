import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  KYCStatus,
  DisputeStatus,
  VerificationStatus,
  CarStatus,
  UserRole,
  PaymentStatus,
  BookingStatus,
} from '@prisma/client';

import {
  CreatePromotionDto,
  UpdatePromotionDto,
  RunSettlementDto,
  // SettlementHistoryQueryDto,
  RejectKYCDto,
  CreateCategoryDto,
  CreateLocationDto,
  ReportDateRangeDto,
  PromotionQueryDto,
} from './dto/admin.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  private readonly PLATFORM_USER_ID = '65f1a2b3c4d5e6f7a8b9c0d1';

  constructor(private prisma: PrismaService) {}

  // ================= 1. REPORTS =================

  async getOverviewReport() {
    const [users, cars, bookings, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.car.count(),
      this.prisma.booking.count(),
      this.prisma.ownerTransaction.aggregate({
        where: { type: 'RENTAL_INCOME', status: 'completed' },
        _sum: { amount: true },
      }),
    ]);
    return {
      totalUsers: users,
      totalCars: cars,
      totalBookings: bookings,
      totalRevenue: revenue._sum.amount || 0,
    };
  }

  async getBookingsReport(query: ReportDateRangeDto) {
    const { from, to } = query;
    return this.prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      _count: { _all: true },
    });
  }

  async getRevenueReport(query: ReportDateRangeDto) {
    const { from, to } = query;
    return this.prisma.payment.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      _sum: { amount: true },
    });
  }

  // ================= 2. CAR MANAGEMENT =================

  async getPendingCars() {
    return this.prisma.car.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        category: true,
        location: true,
        documents: true,
      },
    });
  }

  async approveCar(carId: string) {
    return this.prisma.car.update({
      where: { id: carId },
      data: {
        verificationStatus: VerificationStatus.APPROVED,
        status: CarStatus.APPROVED,
      },
    });
  }

  async getAllCars(status?: string) {
    return this.prisma.car.findMany({
      where: status ? { verificationStatus: status as any } : {},
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        // Bạn có thể include thêm Category hoặc Location nếu cần hiển thị ở CarTable
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async rejectCar(carId: string, reason: string) {
    // Theo schema của bạn, chúng ta cập nhật verificationStatus
    // Lưu ý: Nếu bạn có trường để lưu lý do (như rejectionReason), hãy thêm vào data
    return this.prisma.car.update({
      where: { id: carId },
      data: {
        verificationStatus: 'REJECTED',
        // Ví dụ: ghi chú lại lý do để chủ xe xem được ở Profile của họ
        description: `Lý do từ chối: ${reason}`,
      },
    });
  }

  // ================= 3. KYC =================

  async getKycCustomers(query: any) {
    const { page = 1, limit = 20, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: status as KYCStatus } : {};

    const [items, total] = await Promise.all([
      this.prisma.kYC.findMany({
        where,
        include: { user: true },
        skip,
        take: Number(limit),
      }),
      this.prisma.kYC.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async approveKyc(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verificationStatus: VerificationStatus.APPROVED,
        },
      });
      return tx.kYC.update({
        where: { userId },
        data: { status: KYCStatus.APPROVED, verifiedAt: new Date() },
      });
    });
  }

  async rejectKyc(userId: string, dto: RejectKYCDto) {
    return this.prisma.kYC.update({
      where: { userId },
      data: {
        status: KYCStatus.REJECTED,
        rejectionReason: dto.rejectionReason,
      },
    });
  }

  // ================= 4. PROMOTIONS =================

  async createPromotion(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: dto });
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }
  async getPromotions(query: PromotionQueryDto) {
    const { isActive } = query;

    return this.prisma.promotion.findMany({
      where: {
        // Ép kiểu về any để tránh TS check so sánh string/boolean nếu DTO chưa chuẩn
        isActive:
          isActive !== undefined ? String(isActive) === 'true' : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ================= 5. PAYMENTS & ESCROW =================

  async getPayments(query: any) {
    const { page = 1, limit = 20 } = query;
    return this.prisma.payment.findMany({
      include: { user: true, booking: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
  }

  async releasePayment(dto: {
    bookingId: string;
    platformFeePercent?: number; // Truyền từ ngoài vào hoặc dùng mặc định
  }) {
    // Đổi mặc định từ 10 thành 20 theo yêu cầu mới của bạn
    const { bookingId, platformFeePercent = 20 } = dto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
        car: true,
        trip: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // Kiểm tra trạng thái chuyến đi
    if (!booking.trip || booking.trip.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Chuyến đi chưa hoàn thành, không thể giải ngân',
      );
    }

    // Tìm khoản thanh toán thành công của khách hàng
    const payment = booking.payments.find(
      (p) => p.status === PaymentStatus.COMPLETED,
    );
    if (!payment)
      throw new BadRequestException(
        'Không tìm thấy giao dịch thanh toán thành công',
      );

    // TÍNH TOÁN: 20% phí sàn, 80% chủ xe nhận
    const platformFee = Math.round((payment.amount * platformFeePercent) / 100);
    const ownerAmount = payment.amount - platformFee;

    return this.prisma.$transaction(async (tx) => {
      // 1. Khấu trừ tổng số tiền từ ví giữ hộ của Hệ thống (Platform Escrow Wallet)
      await tx.wallet.update({
        where: { userId: this.PLATFORM_USER_ID },
        data: { balance: { decrement: payment.amount } },
      });

      // 2. Cộng tiền thực nhận (80%) vào ví của Chủ xe
      await tx.wallet.update({
        where: { userId: booking.car.ownerId },
        data: { balance: { increment: ownerAmount } },
      });

      // 3. Ghi nhận lịch sử thu nhập cho Chủ xe (OwnerTransaction)
      await tx.ownerTransaction.create({
        data: {
          ownerId: booking.car.ownerId,
          bookingId: booking.id,
          amount: ownerAmount,
          type: 'RENTAL_INCOME',
          status: 'completed',
          description: `Thu nhập thuê xe (Đã trừ ${platformFeePercent}% phí sàn)`,
          metadata: {
            totalPaidByCustomer: payment.amount,
            platformFeeCharged: platformFee,
            feePercentage: platformFeePercent,
          } as any,
        },
      });

      // 4. Cập nhật trạng thái Booking thành COMPLETED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      return {
        success: true,
        ownerReceived: ownerAmount,
        platformFee: platformFee,
      };
    });
  }

  async refundPayment(dto: {
    bookingId: string;
    refundPercent?: number;
    reason: string;
  }) {
    const { bookingId, refundPercent = 100, reason } = dto;
    const PLATFORM_SYSTEM_ID = '65f1a2b3c4d5e6f7a8b9c0d1'; // ID ví Escrow của sàn

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) throw new NotFoundException('Booking không tồn tại');

    const payment = booking.payments.find(
      (p) => p.status === PaymentStatus.COMPLETED,
    );
    if (!payment)
      throw new BadRequestException('Đơn hàng chưa được thanh toán thành công');

    const refundAmount = (payment.amount * refundPercent) / 100;

    return this.prisma.$transaction(async (tx) => {
      // 1. ✅ TRỪ tiền từ ví Hệ thống (Admin)
      await tx.wallet.update({
        where: { userId: PLATFORM_SYSTEM_ID },
        data: { balance: { decrement: refundAmount } },
      });

      // 2. ✅ Cập nhật trạng thái giao dịch
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          failureReason: `Refund ${refundPercent}%: ${reason}`,
        },
      });

      // 3. ✅ Ghi log giao dịch (Transaction History)
      await tx.walletTransaction.create({
        data: {
          walletId: (
            await tx.wallet.findFirst({ where: { userId: PLATFORM_SYSTEM_ID } })
          ).id,
          amount: refundAmount,
          type: 'REFUND',
          description: `Hoàn tiền ${refundPercent}% cho khách hàng ${booking.customerId}. Lý do: ${reason}`,
          metadata: { bookingId, percent: refundPercent } as any,
        },
      });

      // 4. ✅ Hủy Booking (nếu cần thiết trong quy trình của bạn)
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      return {
        success: true,
        refundAmount,
        message: 'Hệ thống đã xác nhận hoàn tiền và trừ quỹ Escrow',
      };
    });
  }

  // ================= 6. SETTLEMENTS =================

  // src/modules/admin/admin.service.ts

  async runSettlement(dto: RunSettlementDto) {
    const owners = await this.prisma.user.findMany({
      where: { role: UserRole.OWNER },
    });

    for (const owner of owners) {
      const total = await this.prisma.ownerTransaction.aggregate({
        where: {
          ownerId: owner.id,
          type: 'RENTAL_INCOME',
          status: 'completed',
        },
        _sum: { amount: true },
      });

      await this.prisma.settlement.create({
        data: {
          owner: { connect: { id: owner.id } },
          period: dto.period,
          totalEarnings: total._sum.amount || 0,
          totalPayouts: 0, // BẮT BUỘC: Thêm field này để hết lỗi missing property
          netAmount: total._sum.amount || 0,
          status: 'COMPLETED', // Hoặc dùng SettlementStatus.COMPLETED từ @prisma/client
        },
      });
    }
    return { success: true };
  }
  // ================= 6. SETTLEMENTS =================

  async getSettlementHistory(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.settlement.findMany({
        include: { owner: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.settlement.count(),
    ]);

    return { items, total, page, limit };
  }

  // ================= 7. WITHDRAWS =================

  async getPendingWithdraws(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { type: 'WITHDRAW', status: 'pending' };

    const [items, total] = await Promise.all([
      this.prisma.ownerTransaction.findMany({
        where,
        include: { owner: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ownerTransaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async approveWithdraw(id: string) {
    return this.prisma.ownerTransaction.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  async rejectWithdraw(id: string, reason: string) {
    const txData = await this.prisma.ownerTransaction.findUnique({
      where: { id },
    });

    if (!txData) {
      throw new NotFoundException('Withdraw transaction not found');
    }

    return this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId: txData.ownerId },
        data: { balance: { increment: txData.amount } },
      }),
      this.prisma.ownerTransaction.update({
        where: { id },
        data: { status: 'failed', description: reason },
      }),
    ]);
  }

  // ================= 8. OTHERS =================

  async getAllDisputes(query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.dispute.findMany({
        skip,
        take: limit,
        include: {
          initiator: {
            select: { firstName: true, lastName: true, email: true },
          },
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispute.count(),
    ]);

    return { items, total, page, limit };
  }

  async updateToInProgress(disputeId: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: DisputeStatus.IN_PROGRESS },
    });
  }

  // 2. Giải quyết vấn đề (Chuyển sang RESOLVED hoặc CLOSED)
  async resolveDispute(
    disputeId: string,
    dto: { resolution: string; status: DisputeStatus }, // Đổi finalStatus thành status
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) throw new NotFoundException('Không tìm thấy khiếu nại');

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.status, // Sử dụng dto.status
        description: `${dispute.description}\n\n[Admin Resolution]: ${dto.resolution}`,
      },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async createLocation(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: dto });
  }

  async getPlatformWallet() {
    return this.prisma.wallet.findUnique({
      where: { userId: this.PLATFORM_USER_ID },
    });
  }

  async getAllBookings(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
          car: { select: { name: true, licensePlate: true } },
        },
      }),
      this.prisma.booking.count(),
    ]);

    return { items, total, page, limit };
  }

  async getAllContracts(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.contract.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customer: { select: { firstName: true, lastName: true } },
              car: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.contract.count(),
    ]);

    return { items, total, page, limit };
  }

  async getUsers(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          verificationStatus: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return { items, total, page, limit };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  async getPendingReleaseTrips(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TripWhereInput = {
      status: 'COMPLETED', // ✅ TypeScript sẽ tự infer đúng type khi có Prisma.TripWhereInput
      booking: { status: BookingStatus.CONFIRMED },
    };

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: { include: { payments: true } },
          car: { include: { owner: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async autoReleaseCompletedTrips() {
    const { items: trips } = await this.getPendingReleaseTrips({
      page: 1,
      limit: 100,
    });

    let count = 0;
    for (const trip of trips) {
      try {
        await this.releasePayment({ bookingId: trip.bookingId });
        count++;
      } catch (error) {
        console.error(
          `Failed to release payment for booking ${trip.bookingId}:`,
          error,
        );
      }
    }

    return { processed: count };
  }
}
