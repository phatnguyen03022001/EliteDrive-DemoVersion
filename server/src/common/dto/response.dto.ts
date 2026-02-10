export class ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;

  constructor(data: T, message = 'Success', success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message, true);
  }

  static error<T>(message: string, data: T = null): ApiResponse<T> {
    return new ApiResponse(data, message, false);
  }
}

/**
 * DTO dành cho các phản hồi có phân trang
 */
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
}
