// src/modules/owner/owner.service.ts - REFACTORED
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCarDto,
  UpdateCarDto,
  CreateCarDocumentDto,
  CreatePricingDto,
  BlockCalendarDto,
  OwnerBookingQueryDto,
  RejectBookingDto,
  WithdrawRequestDto,
  TripCheckoutDto,
  TripCheckinDto,
  UpdateOwnerProfileDto,
  OwnerProfileResponseDto,
  KYCStatusResponseDto,
} from './dto/owner.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UploadService } from '../upload/upload.service';
import { CreateKYCDto } from '../customer/dto/customer.dto';
import {
  KYCStatus,
  UserRole,
  Prisma,
  BookingStatus,
  CarStatus,
  VerificationStatus,
  PaymentStatus,
} from '@prisma/client';

@Injectable()
export class OwnerService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ==================== PROFILE ====================
  async getProfile(userId: string): Promise<OwnerProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        ownerCompanyName: true,
        ownerTaxId: true,
        ownerBankAccountName: true,
        ownerBankAccountNumber: true,
        ownerBankCode: true,
        address: true,
        city: true,
        country: true,
        verificationStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Owner không tồn tại');
    }

    return {
      id: user.id,
      userId: user.id,
      companyName: user.ownerCompanyName,
      taxId: user.ownerTaxId,
      bankAccountName: user.ownerBankAccountName,
      bankAccountNumber: user.ownerBankAccountNumber,
      bankCode: user.ownerBankCode,
      address: user.address,
      city: user.city,
      country: user.country,
      verificationStatus: user.verificationStatus as string,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateOwnerProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Owner không tồn tại');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ownerCompanyName: dto.companyName,
        ownerTaxId: dto.taxId,
        ownerBankAccountName: dto.bankAccountName,
        ownerBankAccountNumber: dto.bankAccountNumber,
        ownerBankCode: dto.bankCode,
        address: dto.address,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  // ==================== KYC ====================
  async submitKyc(
    userId: string,
    dto: CreateKYCDto,
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
  ) {
    // 1. Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 2. Check existing KYC
    const existing = await this.prisma.kYC.findUnique({ where: { userId } });
    if (existing && existing.status === KYCStatus.PENDING) {
      throw new BadRequestException(
        'Hồ sơ KYC đang chờ duyệt, không thể gửi thêm.',
      );
    }

    // 3. Validate files
    const frontFile = files?.documentFront?.[0];
    const backFile = files?.documentBack?.[0];
    const faceFile = files?.faceImage?.[0];

    if (!frontFile || !backFile || !faceFile) {
      throw new BadRequestException(
        'Cần đủ mặt trước, mặt sau GTTT và ảnh chân dung.',
      );
    }

    // 4. Upload files
    const [frontUrl, backUrl, faceUrl] = await Promise.all([
      this.uploadService.uploadFile(frontFile, 'owners/kyc/front'),
      this.uploadService.uploadFile(backFile, 'owners/kyc/back'),
      this.uploadService.uploadFile(faceFile, 'owners/kyc/faces'),
    ]);

    // 5. Upsert KYC
    return this.prisma.$transaction(async (tx) => {
      const kyc = await tx.kYC.upsert({
        where: { userId },
        update: {
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          documentFrontUrl: frontUrl,
          documentBackUrl: backUrl,
          faceImageUrl: faceUrl,
          status: KYCStatus.PENDING,
          submittedAt: new Date(),
          rejectionReason: null,
        },
        create: {
          userId,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          documentFrontUrl: frontUrl,
          documentBackUrl: backUrl,
          faceImageUrl: faceUrl,
          status: KYCStatus.PENDING,
        },
      });

      return kyc;
    });
  }

  async getKycStatus(userId: string): Promise<KYCStatusResponseDto> {
    const kyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (!kyc) {
      return {
        status: KYCStatus.NONE,
        documentType: null,
        documentNumber: null,
        documentFrontUrl: null,
        documentBackUrl: null,
        faceImageUrl: null,
        rejectionReason: null,
        submittedAt: null,
      };
    }

    return {
      status: kyc.status,
      documentType: kyc.documentType,
      documentNumber: kyc.documentNumber,
      documentFrontUrl: kyc.documentFrontUrl,
      documentBackUrl: kyc.documentBackUrl,
      faceImageUrl: kyc.faceImageUrl,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.submittedAt,
    };
  }

  // ==================== CARS ====================
  async createCar(
    userId: string,
    dto: CreateCarDto,
    files: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    // 1. Validate owner is setup
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        ownerCompanyName: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Bạn không phải là chủ xe');
    }

    // if (!user.ownerCompanyName) {
    //   throw new BadRequestException(
    //     'Bạn chưa hoàn tất hồ sơ chủ xe. Vui lòng cập nhật thông tin công ty/cá nhân trước khi đăng ký xe.',
    //   );
    // }

    // 2. Validate KYC
    const kyc = await this.prisma.kYC.findUnique({ where: { userId } });
    if (!kyc || kyc.status !== KYCStatus.APPROVED) {
      throw new ForbiddenException('KYC chưa được approved. Không thể tạo xe.');
    }

    // 3. Validate and upload images
    const mainFile = files?.mainImage?.[0];
    if (!mainFile) {
      throw new BadRequestException('Ảnh chính của xe là bắt buộc');
    }

    const mainImageUrl = await this.uploadService.uploadFile(
      mainFile,
      'cars/main',
    );

    let galleryUrls: string[] = [];
    if (files?.images?.length) {
      galleryUrls = await Promise.all(
        files.images.map((f) =>
          this.uploadService.uploadFile(f, 'cars/gallery'),
        ),
      );
    }

    // 4. Create car
    return this.prisma.car.create({
      data: {
        ownerId: userId,
        name: dto.name,
        brand: dto.brand,
        model: dto.model,
        year: Number(dto.year),
        licensePlate: dto.licensePlate,
        seatCount: Number(dto.seatCount),
        pricePerDay: Number(dto.pricePerDay),
        pricePerHour: dto.pricePerHour ? Number(dto.pricePerHour) : undefined,
        pricePerWeek: dto.pricePerWeek ? Number(dto.pricePerWeek) : undefined,
        pricePerMonth: dto.pricePerMonth
          ? Number(dto.pricePerMonth)
          : undefined,
        categoryId: dto.categoryId,
        locationId: dto.locationId,
        mainImageUrl,
        imageUrls: galleryUrls,
        status: CarStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING,
      },
    });
  }

  async getMyCars(userId: string, query: PaginationDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CarWhereInput = { ownerId: userId };

    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateCar(
    userId: string,
    carId: string,
    dto: UpdateCarDto,
    files?: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    // 1. Kiểm tra quyền sở hữu
    await this.assertOwnerCar(userId, carId);

    // 2. Xử lý upload ảnh mới (nếu có)
    const updateData: any = {
      name: dto.name,
      brand: dto.brand,
      model: dto.model,
      year: dto.year ? Number(dto.year) : undefined,
      licensePlate: dto.licensePlate,
      seatCount: dto.seatCount ? Number(dto.seatCount) : undefined,
      pricePerDay: dto.pricePerDay ? Number(dto.pricePerDay) : undefined,
      pricePerHour: dto.pricePerHour ? Number(dto.pricePerHour) : undefined,
      categoryId: dto.categoryId,
      locationId: dto.locationId,
    };

    // Nếu có upload lại ảnh chính
    if (files?.mainImage?.[0]) {
      const mainImageUrl = await this.uploadService.uploadFile(
        files.mainImage[0],
        'cars/main',
      );
      updateData.mainImageUrl = mainImageUrl;
    }

    // Nếu có upload thêm album ảnh (gallery)
    // Lưu ý: Tùy logic bạn muốn là "Ghi đè" hay "Thêm vào" album cũ
    if (files?.images?.length) {
      const galleryUrls = await Promise.all(
        files.images.map((f) =>
          this.uploadService.uploadFile(f, 'cars/gallery'),
        ),
      );
      updateData.imageUrls = galleryUrls; // Ở đây đang là ghi đè album cũ
    }

    // 3. Cập nhật vào Database
    return this.prisma.car.update({
      where: { id: carId },
      data: updateData,
    });
  }

  async deleteCar(userId: string, carId: string) {
    await this.assertOwnerCar(userId, carId);
    return this.prisma.car.delete({ where: { id: carId } });
  }

  async addCarDocument(
    userId: string,
    carId: string,
    dto: CreateCarDocumentDto,
  ) {
    await this.assertOwnerCar(userId, carId);

    return this.prisma.carDocument.create({
      data: {
        carId,
        documentType: dto.documentType,
        documentUrl: dto.documentUrl,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async getCarDocuments(userId: string, carId: string) {
    await this.assertOwnerCar(userId, carId);

    return this.prisma.carDocument.findMany({
      where: { carId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  // ==================== PRICING (MERGED INTO CAR) ====================
  async updateCarPricing(userId: string, carId: string, dto: CreatePricingDto) {
    await this.assertOwnerCar(userId, carId);

    return this.prisma.car.update({
      where: { id: carId },
      data: {
        pricePerDay: dto.pricePerDay ? Number(dto.pricePerDay) : undefined,
        pricePerHour: dto.pricePerHour ? Number(dto.pricePerHour) : undefined,
        pricePerWeek: dto.pricePerWeek ? Number(dto.pricePerWeek) : undefined,
        pricePerMonth: dto.pricePerMonth
          ? Number(dto.pricePerMonth)
          : undefined,
        discountPercentage: dto.discountPercentage ?? 0,
      },
    });
  }

  // ==================== AVAILABILITY ====================
  async blockAvailability(
    userId: string,
    carId: string,
    dto: BlockCalendarDto,
  ) {
    await this.assertOwnerCar(userId, carId);

    const isBlocked = dto.isBlocked ?? true;

    return this.prisma.availability.upsert({
      where: { carId_date: { carId, date: new Date(dto.date) } },
      update: {
        isAvailable: !isBlocked,
        blockedReason: isBlocked ? dto.blockedReason : null,
      },
      create: {
        carId,
        date: new Date(dto.date),
        isAvailable: !isBlocked,
        blockedReason: isBlocked ? dto.blockedReason : null,
      },
    });
  }

  async getAvailability(
    userId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
  ) {
    await this.assertOwnerCar(userId, carId);

    return this.prisma.availability.findMany({
      where: {
        carId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ==================== BOOKINGS ====================
  async getBookings(
    userId: string,
    query: PaginationDto & OwnerBookingQueryDto,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      car: { ownerId: userId },
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          car: { select: { name: true, licensePlate: true } },
          customer: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async approveBooking(userId: string, bookingId: string) {
    return this.updateBookingStatus(userId, bookingId, BookingStatus.APPROVED);
  }

  async rejectBooking(
    userId: string,
    bookingId: string,
    dto: RejectBookingDto,
  ) {
    return this.updateBookingStatus(
      userId,
      bookingId,
      BookingStatus.REJECTED,
      dto.reason,
    );
  }
  private async updateBookingStatus(
    ownerId: string, // Đổi tên cho rõ nghĩa là ID của chủ xe
    bookingId: string,
    newStatus: BookingStatus,
    reason?: string,
  ) {
    // 1. Tìm booking kèm theo thông tin thanh toán (để hoàn tiền nếu cần)
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, car: { ownerId: ownerId } },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundException(
        'Booking không tồn tại hoặc bạn không có quyền',
      );
    }

    // 2. Chặn việc duyệt/từ chối các đơn đã hủy hoặc đã xử lý rồi
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Không thể xử lý đơn đang ở trạng thái ${booking.status}`,
      );
    }

    // 3. Sử dụng Transaction để đảm bảo tính toàn vẹn (Update Status + Refund)
    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: newStatus, notes: reason },
      });

      // 4. Logic Hoàn tiền nếu Owner REJECT đơn đã thanh toán (Giống bên Customer)
      if (newStatus === BookingStatus.REJECTED) {
        const completedPayment = booking.payments.find(
          (p) => p.status === PaymentStatus.COMPLETED && !p.refundedAt,
        );

        if (completedPayment) {
          const wallet = await tx.wallet.upsert({
            where: { userId: booking.customerId },
            create: {
              userId: booking.customerId,
              balance: completedPayment.amount,
            },
            update: { balance: { increment: completedPayment.amount } },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: completedPayment.amount,
              type: 'REFUND',
              description: `Hoàn tiền: Chủ xe từ chối đơn ${bookingId}`,
            },
          });

          await tx.payment.update({
            where: { id: completedPayment.id },
            data: { refundedAt: new Date() },
          });
        }
      }

      return updatedBooking;
    });
  }

  // ==================== TRIPS ====================
  async checkinTrip(userId: string, tripId: string, dto: TripCheckinDto) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id: tripId,
        car: { ownerId: userId },
        status: 'UPCOMING',
      },
      include: { booking: true },
    });

    if (!trip) {
      throw new ForbiddenException('Không có quyền hoặc trip không hợp lệ');
    }

    return this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'ONGOING',
        startOdometer: dto.startOdometer,
        startFuelLevel: dto.startFuelLevel,
        pickupNotes: dto.pickupNotes,
        checkinTime: new Date(),
      },
    });
  }

  async checkoutTrip(userId: string, tripId: string, dto: TripCheckoutDto) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id: tripId,
        car: { ownerId: userId },
        status: 'ONGOING',
        booking: { status: BookingStatus.CONFIRMED },
      },
      include: { booking: true },
    });

    if (!trip) {
      throw new ForbiddenException('Không có quyền hoặc trip không hợp lệ');
    }

    // ✅ CHỈ update trip, KHÔNG động vào booking và transaction
    return this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        endOdometer: dto.endOdometer,
        endFuelLevel: dto.endFuelLevel,
        dropoffNotes: dto.dropoffNotes,
        checkoutTime: new Date(),
      },
    });
  }

  async getTrips(userId: string, query: PaginationDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TripWhereInput = {
      car: { ownerId: userId },
    };

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              customer: {
                select: { firstName: true, lastName: true, phone: true },
              },
            },
          },
          car: { select: { name: true, licensePlate: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ==================== FINANCE ====================
  async getOwnerTransactions(userId: string, query: PaginationDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OwnerTransactionWhereInput = { ownerId: userId };

    const [data, total] = await Promise.all([
      this.prisma.ownerTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ownerTransaction.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getEarnings(userId: string, query: PaginationDto = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OwnerTransactionWhereInput = {
      ownerId: userId,
      type: 'RENTAL_INCOME',
    };

    const [data, total] = await Promise.all([
      this.prisma.ownerTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ownerTransaction.count({ where }),
    ]);

    const totalAmount = data.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      data,
      total,
      page,
      limit,
      totalEarnings: totalAmount,
    };
  }

  async requestWithdraw(userId: string, dto: WithdrawRequestDto) {
    // Validate owner has wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet chưa được tạo');
    }

    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Số dư không đủ');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create withdraw transaction
      const withdraw = await tx.ownerTransaction.create({
        data: {
          ownerId: userId,
          amount: dto.amount,
          type: 'WITHDRAW',
          status: 'pending',
          description: `Withdraw request - ${dto.description ?? 'No reason provided'}`,
          metadata: {
            bankAccountNumber: dto.bankAccountNumber,
            bankAccountName: dto.bankAccountName,
          },
        },
      });

      // Hold money in wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: dto.amount } },
      });

      // Log transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -dto.amount,
          type: 'WITHDRAW_PENDING',
          description: `Withdraw request #${withdraw.id}`,
          metadata: {
            withdrawId: withdraw.id,
          },
        },
      });

      return withdraw;
    });
  }

  // ==================== WALLET ====================
  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Auto-create wallet if doesn't exist
      return this.prisma.wallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  // ==================== DASHBOARD ====================
  async getDashboardOverview(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    const [cars, bookings, wallet, income] = await Promise.all([
      this.prisma.car.count({ where: { ownerId: userId } }),
      this.prisma.booking.count({ where: { car: { ownerId: userId } } }),
      this.prisma.wallet.findUnique({ where: { userId } }),
      this.prisma.ownerTransaction.aggregate({
        where: {
          ownerId: userId,
          type: 'RENTAL_INCOME',
          status: 'completed',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalCars: cars,
      totalBookings: bookings,
      balance: wallet?.balance ?? 0,
      totalIncome: income._sum.amount ?? 0,
    };
  }

  async submitCarForReview(userId: string, carId: string) {
    await this.assertOwnerCar(userId, carId);

    return this.prisma.car.update({
      where: { id: carId },
      data: { status: CarStatus.PENDING },
    });
  }

  // ==================== DISPUTES ====================
  async respondDispute(userId: string, disputeId: string, message: string) {
    const dispute = await this.prisma.dispute.findFirst({
      where: {
        id: disputeId,
        booking: { car: { ownerId: userId } },
        status: { not: 'CLOSED' },
      },
    });

    if (!dispute) {
      throw new ForbiddenException(
        'Dispute không tồn tại hoặc bạn không có quyền',
      );
    }

    return this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        message,
      },
    });
  }

  // ==================== HELPERS ====================
  private async assertOwnerCar(userId: string, carId: string) {
    const car = await this.prisma.car.findUnique({
      where: { id: carId },
      select: { ownerId: true },
    });

    if (!car) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    if (car.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền quản lý xe này');
    }
  }
}
