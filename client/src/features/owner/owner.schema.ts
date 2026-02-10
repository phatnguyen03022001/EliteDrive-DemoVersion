import { z } from "zod";

// ==================== ENUMS ====================
export const BookingStatus = z.enum(["PENDING", "APPROVED", "REJECTED", "CONFIRMED", "COMPLETED", "CANCELLED"]);
export const TripStatus = z.enum(["UPCOMING", "ONGOING", "COMPLETED"]);
export const CarStatus = z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]);

// ==================== 1. CAR MANAGEMENT ====================
export const CreateCarSchema = z.object({
  name: z.string().min(1, "Tên xe không được để trống"),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(2026), // Sử dụng coerce để ép kiểu từ string sang number
  licensePlate: z.string().min(1),
  seatCount: z.coerce.number().min(2).max(50),
  pricePerDay: z.coerce.number().min(0),
  pricePerHour: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  color: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  description: z.string().optional(),
});
export const UpdateCarSchema = CreateCarSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

// ==================== 2. DOCUMENTS & PRICING ====================
export const CreateCarDocumentSchema = z.object({
  documentType: z.string().min(1),
  documentUrl: z.string().url(),
  expiryDate: z.string().optional(),
});

export const CreateKYCSchema = z.object({
  documentType: z.string().min(1, "Loại giấy tờ là bắt buộc"),
  documentNumber: z.string().min(1, "Số giấy tờ không được để trống"),
});

export const CreatePricingSchema = z.object({
  pricePerDay: z.number().min(0),
  pricePerHour: z.number().optional(),
  pricePerWeek: z.number().optional(),
  pricePerMonth: z.number().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

export const BlockCalendarSchema = z.object({
  date: z.string(),
  blockedReason: z.string().optional(),
  isBlocked: z.boolean().optional(),
});

// ==================== 3. TRIPS ====================
export const TripCheckinSchema = z.object({
  startOdometer: z.coerce.number().min(0),
  startFuelLevel: z.coerce.number().min(0).max(100),
  pickupNotes: z.string().optional(),
});

export const TripCheckoutSchema = z.object({
  endOdometer: z.coerce.number().min(0),
  endFuelLevel: z.coerce.number().min(0).max(100),
  dropoffNotes: z.string().optional(),
});

// ==================== 4. BOOKINGS ====================
export const RejectBookingSchema = z.object({
  reason: z.string().min(1, "Vui lòng nhập lý do từ chối"),
});

// ==================== 5. FINANCE ====================
export const WithdrawRequestSchema = z.object({
  amount: z.coerce.number().min(50000, "Số tiền tối thiểu 50,000 VND"),
  bankAccountNumber: z.string().min(5).optional(),
  bankAccountName: z.string().min(2).optional(),
  description: z.string().optional(),
});

// ==================== 6. PROFILE ====================
export const UpdateOwnerProfileSchema = z.object({
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankCode: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const GetCalendarSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// ==================== EXPORT TYPES ====================
export type CreateCarInput = z.infer<typeof CreateCarSchema>;
export type UpdateCarInput = z.infer<typeof UpdateCarSchema>;
export type CreateKYCInput = z.infer<typeof CreateKYCSchema>;
export type CreateCarDocumentInput = z.infer<typeof CreateCarDocumentSchema>;
export type CreatePricingInput = z.infer<typeof CreatePricingSchema>;
export type BlockCalendarInput = z.infer<typeof BlockCalendarSchema>;
export type TripCheckinInput = z.infer<typeof TripCheckinSchema>;
export type TripCheckoutInput = z.infer<typeof TripCheckoutSchema>;
export type RejectBookingInput = z.infer<typeof RejectBookingSchema>;
export type WithdrawRequestInput = z.infer<typeof WithdrawRequestSchema>;
export type UpdateOwnerProfileInput = z.infer<typeof UpdateOwnerProfileSchema>;
