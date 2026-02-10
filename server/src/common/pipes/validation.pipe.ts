import { ValidationPipe, BadRequestException } from '@nestjs/common';

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true, // Xóa các field không được định nghĩa trong DTO
  transform: true, // Tự động convert type (VD: string sang number)
  forbidNonWhitelisted: true,
  exceptionFactory: (errors) => {
    const result = errors.map((error) => ({
      property: error.property,
      message: error.constraints[Object.keys(error.constraints)[0]],
    }));
    return new BadRequestException(result);
  },
});
