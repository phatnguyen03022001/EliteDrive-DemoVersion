import { z } from "zod";

// --- ENUMS (Khớp với Prisma Client) ---
export const UserRole = z.enum(["CUSTOMER", "OWNER", "ADMIN"]);
export const KYCStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const BookingStatus = z.enum(["PENDING", "APPROVED", "REJECTED", "CONFIRMED", "COMPLETED", "CANCELLED"]);
export const TripStatus = z.enum(["UPCOMING", "ONGOING", "COMPLETED"]);
export const PaymentStatus = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]);

// --- GROUP 1: PROFILE & KYC ---

export const UpdateCustomerProfileSchema = z.object({
  firstName: z.string().min(2, "Tên tối thiểu 2 ký tự").optional(),
  lastName: z.string().min(2, "Họ tối thiểu 2 ký tự").optional(),
  phone: z
    .string()
    .regex(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số")
    .optional(),
  avatar: z.any().optional(),

  // Thông tin bằng lái / Định danh
  dateOfBirth: z.string().optional().or(z.date()),

  // Thông tin địa chỉ (Thường thuộc bảng Profile trong Prisma)
  address: z.string().min(1, "Địa chỉ không được để trống").optional(),
  city: z.string().min(1, "Thành phố không được để trống").optional(),
  country: z.string().min(1, "Quốc gia không được để trống").optional(),
  postalCode: z.string().optional().nullable(), // Cho phép null nếu DB cho phép
});

export const CreateKYCSchema = z.object({
  documentType: z.string().min(1, "Loại giấy tờ là bắt buộc"),
  documentNumber: z.string().min(1, "Số giấy tờ không được để trống"),
});
// --- GROUP 2: BOOKING & TRIPS ---

export const CreateBookingSchema = z
  .object({
    carId: z.string().min(1, "Vui lòng chọn xe"),
    // Ép kiểu string sang Date ngay tại đây
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  });

export const BookingQuerySchema = z.object({
  status: BookingStatus.optional(),
  carId: z.string().optional(),
});

export const TripQuerySchema = z.object({
  status: TripStatus.optional(),
});

// --- GROUP 3: PAYMENT & CONTRACT ---

export const CreatePaymentSchema = z.object({
  bookingId: z.string().min(1),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
});

export const ConfirmPaymentSchema = z.object({
  bookingId: z.string().min(1),
  transactionId: z.string().min(1),
});

export const SignContractSchema = z.object({
  signatureData: z.string().min(1, "Vui lòng ký tên"),
});

// --- GROUP 4: WALLET & REVIEWS ---

export const WalletRefundSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().min(0, "Số tiền không hợp lệ"),
  reason: z.string().min(1, "Vui lòng nhập lý do"),
});

export const CreateReviewSchema = z.object({
  carId: z.string().min(1),
  bookingId: z.string().optional(),
  rating: z.number().min(1, "Tối thiểu 1 sao").max(5, "Tối đa 5 sao"),
  title: z.string().optional(),
  content: z.string().min(5, "Nội dung tối thiểu 5 ký tự").optional(),
});

// ==================== WALLET ====================
export const WalletSchema = z.object({
  id: z.string(),
  balance: z.number(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WalletTransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  type: z.string(), // TOPUP | PAYMENT | REFUND | REFUND_CANCEL | RENTAL_INCOME
  description: z.string().nullable(),
  createdAt: z.string(),
});

export const WalletTransactionListSchema = z.object({
  data: z.array(WalletTransactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const CreateWalletTopupSchema = z.object({
  amount: z.number().min(1000, "Số tiền tối thiểu 1,000 VND"),
  paymentMethod: z.enum(["MOCK_QR", "VNPAY", "MOMO"]),
  description: z.string().optional(),
});

// ==================== PROMOTIONS ====================
export const PromotionSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number(),
  maxUses: z.number().nullable(),
  usedCount: z.number(),
  minBookingAmount: z.number().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
});

export const ApplyPromotionSchema = z.object({
  bookingId: z.string().min(1),
  promoCode: z.string().min(1),
});

// ==================== BOOKING DETAIL ====================
export const BookingDetailSchema = z.object({
  id: z.string(),
  status: BookingStatus,
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number(),
  discountAmount: z.number().nullable(),

  car: z.object({
    id: z.string(),
    name: z.string(),
    brand: z.string(),
    mainImageUrl: z.string().nullable(),
  }),

  payments: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      status: PaymentStatus,
      paymentMethod: z.string(),
      paidAt: z.string().nullable(),
      createdAt: z.string(),
    }),
  ),

  contract: z.any().nullable(),
  trip: z.any().nullable(),
});

// --- EXPORT TYPES ---
export type CreateWalletTopupInput = z.infer<typeof CreateWalletTopupSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof UpdateCustomerProfileSchema>;
export type CreateKYCInput = z.infer<typeof CreateKYCSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type BookingQueryInput = z.infer<typeof BookingQuerySchema>;
export type BookingDetailResponse = z.infer<typeof BookingDetailSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type SignContractInput = z.infer<typeof SignContractSchema>;
export type WalletRefundInput = z.infer<typeof WalletRefundSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export const CancelBookingResponseSchema = BookingDetailSchema;
export type Wallet = z.infer<typeof WalletSchema>;

export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
export type WalletTransactionList = z.infer<typeof WalletTransactionListSchema>;
export type Promotion = z.infer<typeof PromotionSchema>;
export type ApplyPromotionInput = z.infer<typeof ApplyPromotionSchema>;
