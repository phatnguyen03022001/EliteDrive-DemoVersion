import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CarStatus, Prisma, VerificationStatus } from '@prisma/client';

import {
  // PublicCarQueryDto,
  // CarIdParamDto,
  CarAvailabilityQueryDto,
  // BlogSlugParamDto,
  // HomeQueryDto,
  PromotionQueryDto,
  CarReviewQueryDto,
} from './dto/public.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  // ───────────────── PROMOTIONS ───────────

  async getProfile(userId: string): Promise<any> {
    if (!userId) {
      throw new UnauthorizedException('Yêu cầu định danh người dùng');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      avatar: user.avatar,
      role: user.role,
    };
  }

  async getPromotions(query: PaginationDto & PromotionQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PromotionWhereInput = {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    const [data, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ───────────────── CARS ─────────────────

  async getCars(query: any) {
    const {
      page = 1,
      limit = 10,
      brand,
      categoryId,
      locationId,
      minPrice,
      maxPrice,
    } = query;

    const skip = (page - 1) * limit;

    // Lọc theo Schema: status phải là APPROVED và verificationStatus phải là APPROVED
    const where: Prisma.CarWhereInput = {
      status: CarStatus.APPROVED,
      verificationStatus: VerificationStatus.APPROVED,
      isAvailable: true, // Xe phải đang ở trạng thái sẵn sàng
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
      ...((minPrice || maxPrice) && {
        pricePerDay: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { name: true, imageUrl: true } },
          location: { select: { name: true, address: true, city: true } },
          owner: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          // Lấy reviews theo quan hệ trong schema
          reviews: {
            select: {
              rating: true,
              content: true,
              createdAt: true,
              customer: {
                // Trong schema là quan hệ 'customer' (User)
                select: { firstName: true, lastName: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3, // Lấy nhanh 3 review tiêu biểu
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where }),
    ]);

    // Trả về dữ liệu kèm theo các field đã gộp trong Prisma (averageRating, totalTrips)
    return {
      data, // averageRating và totalTrips đã có sẵn trong model Car của bạn
      total,
      page,
      limit,
    };
  }

  async getCarDetail(id: string) {
    const car = await this.prisma.car.findFirst({
      where: {
        id,
        status: CarStatus.APPROVED,
        verificationStatus: VerificationStatus.APPROVED,
      },
      include: {
        category: true,
        location: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
            _count: { select: { cars: true } }, // Xem chủ xe có bao nhiêu xe khác
          },
        },
        reviews: {
          include: {
            customer: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          // Xem các tài liệu công khai nếu cần (VD: Bảo hiểm)
          where: { documentType: 'INSURANCE' },
        },
      },
    });

    if (!car) {
      throw new NotFoundException('Xe không tồn tại hoặc chưa được duyệt');
    }

    return car;
  }

  // ───────────────── AVAILABILITY ─────────
  async getCarAvailability(
    carId: string,
    query: PaginationDto & CarAvailabilityQueryDto,
  ) {
    const { startDate, endDate } = query;

    if (!startDate || !endDate) {
      return { available: true };
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        carId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      },
    });

    return {
      available: !conflict,
    };
  }

  // ───────────────── REVIEWS ──────────────
  async getCarReviews(carId: string, query: PaginationDto & CarReviewQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { carId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { carId } }),
    ]);

    return { data: items, total, page, limit };
  }

  async getReviewSummary() {
    const result = await this.prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: result._avg.rating ?? 0,
      totalReviews: result._count.rating,
    };
  }
}
