// src/modules/home/home.controller.ts
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublicService } from './public.service';

import {
  PublicCarQueryDto,
  // CarIdParamDto,
  CarAvailabilityQueryDto,
  // BlogSlugParamDto,
  // HomeQueryDto,
  PromotionQueryDto,
  CarReviewQueryDto,
} from './dto/public.dto';

import {
  ApiResponse,
  PaginatedResponseDto,
} from '../../common/dto/response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { CustomerProfileResponseDto } from '../customer/dto/customer.dto';

@Controller('api')
export class PublicController {
  constructor(private readonly homeService: PublicService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile') // Không cần /:id, user chỉ cần gọi GET /profile kèm Header Bearer Token
  async getProfile(
    @CurrentUser('id') userId: string, // Decorator này sẽ lấy 'id' từ request.user (do Guard gán vào)
  ): Promise<ApiResponse<any>> {
    // Nếu userId ở đây vẫn undefined, nghĩa là logic trong @CurrentUser hoặc JwtStrategy đang sai
    const profile = await this.homeService.getProfile(userId);
    return ApiResponse.success(profile);
  }

  // GET /api/promotions
  @Public()
  @Get('promotions')
  async getPromotions(@Query() query: PaginationDto & PromotionQueryDto) {
    const promotions = await this.homeService.getPromotions(query);
    return ApiResponse.success(promotions);
  }

  // GET /api/cars
  @Public()
  @Get('cars')
  async getCars(@Query() query: PaginationDto & PublicCarQueryDto) {
    const { data, total, page, limit } = await this.homeService.getCars(query);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  // GET /api/cars/:car_id
  @Public()
  @Get('cars/:car_id')
  async getCarDetail(@Param('car_id') carId: string) {
    const car = await this.homeService.getCarDetail(carId);
    return ApiResponse.success(car);
  }

  // GET /api/cars/:car_id/availability
  @Public()
  @Get('cars/:car_id/availability')
  async getCarAvailability(
    @Param('car_id') carId: string,
    @Query() query: PaginationDto & CarAvailabilityQueryDto,
  ) {
    const availability = await this.homeService.getCarAvailability(
      carId,
      query,
    );
    return ApiResponse.success(availability);
  }

  // GET /api/cars/:car_id/reviews
  @Public()
  @Get('cars/:car_id/reviews')
  async getCarReviews(
    @Param('car_id') carId: string,
    @Query() query: PaginationDto & CarReviewQueryDto,
  ) {
    const { data, total, page, limit } = await this.homeService.getCarReviews(
      carId,
      query,
    );
    return new PaginatedResponseDto(data, total, page, limit);
  }

  // GET /api/reviews/summary
  @Public()
  @Get('reviews/summary')
  async getReviewSummary() {
    const summary = await this.homeService.getReviewSummary();
    return ApiResponse.success(summary);
  }
}
