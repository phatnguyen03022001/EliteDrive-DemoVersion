import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerService } from "./customer.service";
import {
  BookingQueryInput,
  UpdateCustomerProfileInput,
  CreateBookingInput,
  CreateWalletTopupInput,
  ApplyPromotionInput,
} from "./customer.schema";

// --- KEYS ---
export const customerKeys = {
  all: ["customer"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
  kyc: () => [...customerKeys.all, "kyc"] as const,
  bookings: (params: any) => [...customerKeys.all, "bookings", params] as const,
  trips: (params: any) => [...customerKeys.all, "trips", params] as const,
  payment: (bookingId: string) => [...customerKeys.all, "payment", bookingId] as const,
};

// --- QUERIES ---

// Lấy thông tin Profile
export const useProfile = () => {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: CustomerService.getProfile,
  });
};

// Lấy danh sách Bookings
export const useBookings = (params: { page?: number; limit?: number } & BookingQueryInput) => {
  return useQuery({
    queryKey: customerKeys.bookings(params),
    queryFn: () => CustomerService.getBookings(params),
  });
};

export const useBookingDetail = (bookingId: string) =>
  useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => CustomerService.getBookingDetail(bookingId),
  });

export const useCancelBooking = () =>
  useMutation({
    mutationFn: (bookingId: string) => CustomerService.cancelBooking(bookingId),
  });

// --- MUTATIONS ---

// Cập nhật Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerProfileInput) => CustomerService.updateProfile(dto),
    onSuccess: () => {
      // Invalidate để UI tự động cập nhật lại thông tin mới
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
};

// Đặt xe mới
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookingInput) => CustomerService.createBooking(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.bookings({}) });
    },
  });
};

// Gửi hồ sơ KYC (Xử lý cả file)
export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, files }: { dto: any; files: any }) => CustomerService.submitKyc(dto, files),
    onSuccess: () => {
      // Cập nhật cả 2 để đồng bộ toàn bộ giao diện
      queryClient.invalidateQueries({ queryKey: customerKeys.kyc() });
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
};

export const useWallet = () =>
  useQuery({
    queryKey: ["wallet"],
    queryFn: CustomerService.getWallet,
  });

export const useWalletTransactions = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ["wallet-transactions", params],
    queryFn: () => CustomerService.getWalletTransactions(params),
  });

export const useWalletTopup = () =>
  useMutation({
    mutationFn: (dto: CreateWalletTopupInput) => CustomerService.createWalletTopup(dto),
  });

export const useKycStatus = () => {
  return useQuery({
    queryKey: customerKeys.kyc(),
    queryFn: async () => {
      const response = await CustomerService.getKycStatus();
      // Bóc tách lớp vỏ bọc để trả về đúng object chứa status
      return response.data?.data || response.data || response;
    },
  });
};

// 1. Tạo yêu cầu thanh toán (Để lấy mockQrUrl)
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: (dto: { bookingId: string; paymentMethod: string }) => CustomerService.createPayment(dto),
    onSuccess: (response) => {
      // Trả về data bao gồm mockQrUrl để hiển thị QR Code ở UI
      return response.data;
    },
  });
};

// 2. Xác nhận thanh toán (Dùng cho nút "Tôi đã chuyển khoản" hoặc Webhook)
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { bookingId: string; transactionId: string }) => CustomerService.confirmPayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.bookings({}) });
    },
  });
};

// --- QUERIES MỚI ---

// Lấy thông tin thanh toán theo booking
export const usePaymentDetail = (bookingId: string) => {
  return useQuery({
    queryKey: customerKeys.payment(bookingId),
    queryFn: () => CustomerService.getPaymentByBooking(bookingId),
    enabled: !!bookingId,
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: CustomerService.getActivePromotions,
  });
};

export const useApplyPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ApplyPromotionInput) => CustomerService.applyPromotion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.bookings({}) });
    },
  });
};
