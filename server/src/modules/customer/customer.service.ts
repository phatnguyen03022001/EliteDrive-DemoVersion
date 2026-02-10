// src/modules/customer/customer.service.ts - REFACTORED
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  BookingStatus,
  KYCStatus,
  PaymentStatus,
  UserRole,
  // DisputeStatus,
} from '@prisma/client';

import {
  UpdateCustomerProfileDto,
  CustomerProfileResponseDto,
  CreateKYCDto,
  KYCStatusResponseDto,
  CreateBookingDto,
  BookingQueryDto,
  TripQueryDto,
  TripStatusResponseDto,
  CreatePaymentDto,
  ConfirmPaymentDto,
  SignContractDto,
  ContractResponseDto,
  // WalletRefundDto,
  CreateReviewDto,
  CreateWalletTopupDto,
} from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ==================== PROFILE ====================
  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        kyc: { select: { status: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar, // Avatar cấp 1
      role: user.role,
      isActive: user.isActive,
      userCreatedAt: user.createdAt,
      userUpdatedAt: user.updatedAt,

      profile: {
        id: user.id,
        avatar: user.avatar, // THÊM DÒNG NÀY ĐỂ ĐỒNG BỘ VỚI DTO
        address: user.address,
        city: user.city,
        country: user.country,
        postalCode: user.postalCode,
        profileUpdatedAt: user.updatedAt,

        ...(user.role === 'CUSTOMER' && {
          licenseNumber: user.customerLicenseNumber,
          licenseExpiry: user.customerLicenseExpiry,
          dateOfBirth: user.customerDateOfBirth,
          licenseFrontUrl: user.customerLicenseFrontUrl,
          licenseBackUrl: user.customerLicenseBackUrl,
        }),

        // Trường đặc thù cho Owner
        ...(user.role === 'OWNER' && {
          companyName: user.ownerCompanyName,
          taxId: user.ownerTaxId,
          bankAccountName: user.ownerBankAccountName,
          bankAccountNumber: user.ownerBankAccountNumber,
          bankCode: user.ownerBankCode,
        }),
      },
      kycStatus: user.kyc?.status ?? 'NONE',
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateCustomerProfileDto,
    avatarFile?: Express.Multer.File,
  ): Promise<CustomerProfileResponseDto> {
    // Lấy thông tin user hiện tại để biết Role
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const { firstName, lastName, phone, avatar, ...profileData } = dto;

    // 1. Xử lý Avatar (Giữ nguyên logic của bạn)
    let avatarUrl: string | undefined = undefined;
    if (avatarFile) {
      avatarUrl = await this.uploadService.uploadFile(avatarFile, 'avatars');
    } else if (typeof avatar === 'string' && avatar.startsWith('http')) {
      avatarUrl = avatar;
    }

    // 2. Chuẩn bị dữ liệu update chung (Shared Fields)
    const updateData: any = {
      firstName,
      lastName,
      phone,
      ...(avatarUrl && { avatar: avatarUrl }),
      address: profileData.address,
      city: profileData.city,
      country: profileData.country,
      postalCode: profileData.postalCode,
    };

    // 3. Phân biệt Role để cập nhật các trường đặc thù
    if (user.role === 'CUSTOMER') {
      updateData.customerLicenseNumber = profileData.licenseNumber;
      updateData.customerLicenseExpiry = profileData.licenseExpiry
        ? new Date(profileData.licenseExpiry)
        : undefined;
      updateData.customerDateOfBirth = profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth)
        : undefined;
    }

    // Nếu sau này bạn mở rộng cho OWNER
    else if (user.role === 'OWNER') {
      // updateData.ownerCompanyName = dto.companyName; (Ví dụ vậy)
    }

    // 4. Thực thi Update
    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getProfile(userId);
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
        'Hồ sơ KYC đang trong quá trình phê duyệt.',
      );
    }

    // 3. Validate files
    const frontFile = files?.documentFront?.[0];
    const backFile = files?.documentBack?.[0];
    const faceFile = files?.faceImage?.[0];

    if (!frontFile || !backFile || !faceFile) {
      throw new BadRequestException(
        'Vui lòng cung cấp đủ: Mặt trước, mặt sau và ảnh chân dung.',
      );
    }

    // 4. Upload files
    const folderPath =
      user.role === UserRole.OWNER ? 'owners/kyc' : 'customers/kyc';
    const [frontUrl, backUrl, faceUrl] = await Promise.all([
      this.uploadService.uploadFile(frontFile, `${folderPath}/front`),
      this.uploadService.uploadFile(backFile, `${folderPath}/back`),
      this.uploadService.uploadFile(faceFile, `${folderPath}/faces`),
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

      // Update customer license info if customer
      if (user.role === UserRole.CUSTOMER) {
        await tx.user.update({
          where: { id: userId },
          data: {
            customerLicenseNumber: dto.documentNumber,
          },
        });
      }

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

  // ==================== BOOKINGS ====================
  async createBooking(userId: string, dto: CreateBookingDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // 1. Validate KYC
    const kyc = await this.prisma.kYC.findUnique({ where: { userId } });
    if (!kyc || kyc.status !== KYCStatus.APPROVED) {
      throw new ForbiddenException(
        'Bạn cần hoàn tất xác thực danh tính (KYC) để đặt xe',
      );
    }

    // 2. Check car exists
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
      select: { id: true, pricePerDay: true },
    });

    if (!car) {
      throw new NotFoundException('Không tìm thấy xe');
    }

    // 3. Check booking conflict
    const bookingConflict = await this.prisma.booking.findFirst({
      where: {
        carId: dto.carId,
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
        },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
    });

    if (bookingConflict) {
      throw new BadRequestException(
        'Xe đã được đặt trong khoảng thời gian này',
      );
    }

    // 4. 🚨 Check owner blocked availability
    const blocked = await this.prisma.availability.findFirst({
      where: {
        carId: dto.carId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        isAvailable: false,
      },
    });

    if (blocked) {
      throw new BadRequestException(
        'Xe không khả dụng trong khoảng thời gian này',
      );
    }

    // 5. Calculate price
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) || 1;

    const totalPrice = days * car.pricePerDay;

    // 6. Create booking
    return this.prisma.booking.create({
      data: {
        customerId: userId,
        carId: dto.carId,
        startDate,
        endDate,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        notes: dto.notes,
        totalPrice,
        status: BookingStatus.PENDING,
      },
    });
  }

  async getBookings(userId: string, query: PaginationDto & BookingQueryDto) {
    // Đảm bảo page và limit là kiểu Number trước khi tính toán
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const status = query.status;

    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { customerId: userId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: skip, // Bây giờ skip chắc chắn là Number
        take: limit, // Bây giờ take chắc chắn là Number
        orderBy: { createdAt: 'desc' },
        include: {
          car: { select: { name: true, brand: true, mainImageUrl: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: items, total, page, limit };
  }

  async getBookingDetail(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerId: userId },
      include: {
        car: true,
        payments: { orderBy: { createdAt: 'desc' } },
        contract: true,
        trip: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking');
    }

    return booking;
  }

  async cancelBooking(userId: string, bookingId: string) {
    // 1. Find booking
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
      },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt xe');
    }

    // 2. Validate status
    const allowedStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.APPROVED,
      BookingStatus.CONFIRMED,
    ];

    if (!allowedStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Không thể hủy đơn đặt xe ở trạng thái ${booking.status}`,
      );
    }

    // 3. Process cancellation with refund
    return this.prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // Handle refund if payment completed
      const completedPayment = booking.payments.find(
        (p) => p.status === PaymentStatus.COMPLETED,
      );

      if (completedPayment && !completedPayment.refundedAt) {
        const wallet = await tx.wallet.upsert({
          where: { userId },
          create: { userId, balance: completedPayment.amount },
          update: { balance: { increment: completedPayment.amount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: completedPayment.amount,
            type: 'REFUND',
            description: `Hoàn tiền đơn ${bookingId}`,
            metadata: {
              bookingId,
              refundPercent: 100,
              reason: 'CUSTOMER_CANCEL',
            },
          },
        });

        await tx.payment.update({
          where: { id: completedPayment.id },
          data: { refundedAt: new Date() },
        });
      }

      return updatedBooking;
    });
  }

  // ==================== PAYMENTS ====================
  async createPayment(userId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy booking');
    }

    if (booking.customerId !== userId) {
      throw new ForbiddenException('Không có quyền');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException(
        'Booking phải ở trạng thái APPROVED mới có thể thanh toán',
      );
    }

    // TẠO TRANSACTION ID DUY NHẤT
    const uniqueTransactionId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: userId, // Đảm bảo trường này khớp với schema của bạn (userId hay customerId)
        amount: booking.totalPrice,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.PENDING,
        transactionId: uniqueTransactionId, // BẮT BUỘC PHẢI CÓ VÀ DUY NHẤT
      },
    });
  }

  async confirmPaymentInternal(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || payment.status !== 'PENDING') {
      // Sử dụng Enum PaymentStatus [cite: 1]
      throw new NotFoundException('Giao dịch không hợp lệ');
    }

    /**
     * GIẢI PHÁP: Sử dụng một ObjectId hợp lệ cho ví Hệ thống (24 ký tự hex).
     * Bạn nên tạo một User đặc biệt trong Database với ID này để làm ví tổng.
     */
    const PLATFORM_SYSTEM_ID = '65f1a2b3c4d5e6f7a8b9c0d1';

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái Payment sang COMPLETED [cite: 1]
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionId: `MOCK_TX_${Date.now()}`,
        },
      });

      // 2. Tiền vào Platform Wallet (ESCROW)
      const platformWallet = await tx.wallet.upsert({
        where: { userId: PLATFORM_SYSTEM_ID },
        create: {
          userId: PLATFORM_SYSTEM_ID,
          balance: payment.amount,
          currency: 'VND',
        },
        update: {
          balance: { increment: payment.amount },
        },
      });

      // 3. Log transaction vào WalletTransaction [cite: 50]
      await tx.walletTransaction.create({
        data: {
          walletId: platformWallet.id,
          amount: payment.amount,
          type: 'ESCROW_HELD',
          description: `Giữ tiền đặt cọc cho booking ${payment.bookingId}`,
          metadata: {
            bookingId: payment.bookingId,
            paymentId: payment.id,
          },
        },
      });

      // 4. Booking → CONFIRMED [cite: 1]
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      // 5. Khởi tạo Trip (Hành trình) [cite: 38, 42]
      await tx.trip.create({
        data: {
          bookingId: payment.bookingId,
          customerId: payment.booking.customerId,
          carId: payment.booking.carId,
          status: 'UPCOMING', // Trạng thái mặc định từ TripStatus [cite: 1]
        },
      });

      return updatedPayment;
    });
  }

  async confirmPaymentByQr(paymentId: string) {
    return this.confirmPaymentInternal(paymentId);
  }

  async getPaymentByBooking(userId: string, bookingId: string) {
    return this.prisma.payment.findFirst({
      where: { bookingId, userId },
    });
  }

  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        bookingId: dto.bookingId,
        userId,
        status: PaymentStatus.PENDING,
      },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy yêu cầu thanh toán');
    }

    return this.confirmPaymentInternal(payment.id);
  }

  // ==================== TRIPS ====================
  async getTrips(userId: string, query: PaginationDto & TripQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TripWhereInput = { customerId: userId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { booking: { include: { car: true } } },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { data: items, total, page, limit };
  }

  async getTripStatus(
    userId: string,
    tripId: string,
  ): Promise<TripStatusResponseDto> {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, customerId: userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy trip');
    }

    return trip;
  }

  // ==================== CONTRACTS ====================
  async getContract(userId: string, bookingId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { bookingId, booking: { customerId: userId } },
    });

    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    return contract;
  }

  async signContract(
    userId: string,
    bookingId: string,
    dto: SignContractDto,
  ): Promise<ContractResponseDto> {
    return this.prisma.contract.update({
      where: { bookingId },
      data: {
        customerSignedAt: new Date(),
        customerSignature: dto.signatureData,
        status: 'SIGNED',
      },
    });
  }

  // ==================== WALLET ====================
  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if not exists
      return this.prisma.wallet.create({
        data: { userId },
      });
    }

    return wallet;
  }

  async getWalletTransactions(userId: string, query: PaginationDto = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return { data: [], total: 0, page, limit };
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { data, total, page, limit };
  }

  async createWalletTopup(userId: string, dto: CreateWalletTopupDto) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return this.prisma.payment.create({
      data: {
        userId,
        walletId: wallet.id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async confirmWalletTopup(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Giao dịch không hợp lệ');
    }

    if (!payment.walletId) {
      throw new BadRequestException('Giao dịch không có ví');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          transactionId: `TOPUP_${Date.now()}`,
        },
      });

      await tx.wallet.update({
        where: { id: payment.walletId },
        data: { balance: { increment: payment.amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: payment.walletId,
          amount: payment.amount,
          type: 'TOPUP',
          description: 'Wallet top-up',
        },
      });
    });
  }

  // ==================== REVIEWS ====================
  async createReview(userId: string, dto: CreateReviewDto) {
    // Validate booking if provided
    if (dto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
      });

      if (!booking) {
        throw new NotFoundException('Không tìm thấy booking');
      }

      if (booking.customerId !== userId) {
        throw new ForbiddenException('Không có quyền review booking này');
      }

      if (booking.status !== BookingStatus.COMPLETED) {
        throw new BadRequestException(
          'Chỉ có thể đánh giá sau khi chuyến đi hoàn tất',
        );
      }

      if (booking.carId !== dto.carId) {
        throw new BadRequestException('Car không khớp với booking');
      }

      // Check already reviewed
      const existed = await this.prisma.review.findFirst({
        where: { bookingId: dto.bookingId },
      });

      if (existed) {
        throw new BadRequestException('Booking này đã được đánh giá');
      }
    }

    return this.prisma.review.create({
      data: {
        customerId: userId,
        carId: dto.carId,
        bookingId: dto.bookingId ?? null,
        rating: dto.rating,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async getMyReviews(userId: string, query: any = {}) {
    // Ép kiểu ép buộc sang Number
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { customerId: userId },
        skip: skip, // Prisma sẽ nhận được Number
        take: limit, // Prisma sẽ nhận được Number
        orderBy: { createdAt: 'desc' },
        include: { car: { select: { name: true } } },
      }),
      this.prisma.review.count({ where: { customerId: userId } }),
    ]);

    return { data: items, total, page, limit };
  }

  // ==================== DISPUTES ====================
  async createDispute(userId: string, dto: any) {
    // Kiểm tra xem bookingId có phải là ObjectID hợp lệ không (24 ký tự hex)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(dto.bookingId);

    return this.prisma.dispute.create({
      data: {
        // Nếu là ID chuẩn thì lưu vào quan hệ, nếu không thì để null để tránh lỗi Prisma
        bookingId: isValidObjectId ? dto.bookingId : null,
        initiatedBy: userId,
        // Vẫn lưu mã lỗi/mã rút gọn vào tiêu đề để Admin vẫn đọc được
        title: `[${dto.type}] - ${dto.bookingId || 'Hỗ trợ chung'}`,
        description: dto.description,
        status: 'OPEN',
      },
    });
  }

  async getMyDisputes(userId: string) {
    return this.prisma.dispute.findMany({
      where: { initiatedBy: userId },
      include: {
        booking: {
          select: { car: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== SEARCH & RECOMMENDATIONS ====================
  async searchCars(query: any) {
    const {
      startDate,
      endDate,
      locationId,
      categoryId,
      page = 1,
      limit = 20,
    } = query;

    if (!startDate || !endDate) {
      throw new BadRequestException('startDate và endDate là bắt buộc');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Định dạng ngày không hợp lệ');
    }

    if (start >= end) {
      throw new BadRequestException('endDate phải sau startDate');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.CarWhereInput = {
      isAvailable: true,
      verificationStatus: 'APPROVED',
      ...(locationId && { locationId }),
      ...(categoryId && { categoryId }),

      // ❌ Không trùng booking
      bookings: {
        none: {
          status: {
            notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
          },
          AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
        },
      },

      // ❌ Không bị owner block lịch
      availability: {
        none: {
          date: {
            gte: start,
            lt: end,
          },
          isAvailable: false,
        },
      },
    };

    const [cars, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        include: {
          reviews: { select: { rating: true } },
          location: true,
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where }),
    ]);

    return { data: cars, total, page, limit };
  }

  async previewBookingPrice(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerId: userId },
      include: { car: true },
    });

    if (!booking || !booking.car) {
      throw new NotFoundException('Booking hoặc Car không tồn tại');
    }

    const days =
      Math.ceil(
        (booking.endDate.getTime() - booking.startDate.getTime()) / 86400000,
      ) || 1;

    const basePrice = days * booking.car.pricePerDay;
    const discount = booking.discountAmount ?? 0;
    const insurance = booking.insurancePrice ?? 0;
    const deposit = booking.depositAmount ?? 0;

    return {
      days,
      basePrice,
      insurance,
      deposit,
      discount,
      total: basePrice + insurance + deposit - discount,
    };
  }

  async confirmBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
        status: BookingStatus.CONFIRMED, // ✅ Chỉ check status
      },
      include: {
        trip: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (!booking.trip) {
      throw new BadRequestException('Trip chưa được tạo');
    }

    return booking.trip; // ✅ Trả về trip đã có sẵn
  }

  // ==================== PROMOTIONS ====================
  async getActivePromotions() {
    const now = new Date();

    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyPromotion(userId: string, bookingId: string, promoCode: string) {
    // 1. Validate booking
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: userId,
        status: BookingStatus.PENDING,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại hoặc đã thanh toán');
    }

    // 2. Validate promotion
    const promotion = await this.prisma.promotion.findUnique({
      where: { code: promoCode },
    });

    if (!promotion) {
      throw new NotFoundException('Mã khuyến mãi không tồn tại');
    }

    const now = new Date();

    if (!promotion.isActive) {
      throw new BadRequestException('Mã khuyến mãi không còn hiệu lực');
    }

    if (promotion.startDate > now || promotion.endDate < now) {
      throw new BadRequestException('Mã khuyến mãi đã hết hạn');
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng');
    }

    if (
      promotion.minBookingAmount &&
      booking.totalPrice < promotion.minBookingAmount
    ) {
      throw new BadRequestException(
        `Booking tối thiểu ${promotion.minBookingAmount} VND`,
      );
    }

    // 3. Calculate discount
    let discountAmount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (booking.totalPrice * promotion.discountValue) / 100;
    } else if (promotion.discountType === 'FIXED') {
      discountAmount = promotion.discountValue;
    }

    const newTotalPrice = Math.max(0, booking.totalPrice - discountAmount);

    // 4. Update booking
    return this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          discountAmount,
          totalPrice: newTotalPrice,
        },
      });

      await tx.promotion.update({
        where: { id: promotion.id },
        data: { usedCount: { increment: 1 } },
      });

      return {
        originalPrice: booking.totalPrice,
        discountAmount,
        finalPrice: newTotalPrice,
        promoCode: promotion.code,
      };
    });
  }
}
