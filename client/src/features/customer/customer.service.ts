// src/services/customer.service.ts
import axios from "@/lib/axios";
import {
  UpdateCustomerProfileInput,
  CreateBookingInput,
  BookingQueryInput,
  CreatePaymentInput,
  ConfirmPaymentSchema, // Đổi từ Dto sang Schema/Input theo file của bạn
  SignContractInput,
  WalletRefundInput,
  CreateReviewInput,
  TripQuerySchema, // Khớp với export trong schema
  CreateKYCInput,
  CreateWalletTopupInput,
  ApplyPromotionInput,
} from "./customer.schema";
import z from "zod";

const BASE_URL = "/api/customer";

export const CustomerService = {
  // --- 1. PROFILE & KYC ---
  getProfile: async () => {
    const response = await axios.get(`${BASE_URL}/profile`);
    return response.data;
  },

  updateProfile: async (dto: UpdateCustomerProfileInput) => {
    const response = await axios.put(`${BASE_URL}/profile`, dto);
    return response.data;
  },

  /**
   * Cập nhật KYC: Khớp với CreateKYCSchema có front/back/face
   */
  submitKyc: async (dto: CreateKYCInput, files: { documentFront?: File; documentBack?: File; faceImage?: File }) => {
    const formData = new FormData();

    // Append các field text từ DTO
    Object.keys(dto).forEach((key) => {
      const value = (dto as any)[key];
      if (value) formData.append(key, value);
    });

    // Append các field file (Khớp với logic upload thực tế)
    if (files.documentFront) formData.append("documentFront", files.documentFront);
    if (files.documentBack) formData.append("documentBack", files.documentBack);
    if (files.faceImage) formData.append("faceImage", files.faceImage);

    const response = await axios.post(`${BASE_URL}/kyc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getKycStatus: async () => {
    const response = await axios.get(`${BASE_URL}/kyc/status`);
    return response.data;
  },

  // --- 2. BOOKINGS ---
  createBooking: async (dto: CreateBookingInput) => {
    const response = await axios.post(`${BASE_URL}/bookings`, dto);
    return response.data;
  },

  getBookings: async (params: { page?: number; limit?: number } & BookingQueryInput) => {
    const response = await axios.get(`${BASE_URL}/bookings`, { params });
    return response.data;
  },

  // Booking detail
  getBookingDetail: async (bookingId: string) => {
    const res = await axios.get(`${BASE_URL}/bookings/${bookingId}`);
    return res.data;
  },

  cancelBooking: async (bookingId: string) => {
    const res = await axios.put(`${BASE_URL}/bookings/${bookingId}/cancel`);
    return res.data;
  },

  // --- 3. PAYMENTS ---
  createPayment: async (dto: CreatePaymentInput) => {
    const response = await axios.post(`${BASE_URL}/payments/create`, dto);
    return response.data;
  },

  confirmPayment: async (dto: z.infer<typeof ConfirmPaymentSchema>) => {
    const response = await axios.post(`${BASE_URL}/payments/confirm`, dto);
    return response.data;
  },

  getPaymentByBooking: async (bookingId: string) => {
    const response = await axios.get(`${BASE_URL}/payments/${bookingId}`);
    return response.data;
  },

  // --- 4. TRIPS ---
  getTrips: async (params: { page?: number; limit?: number } & z.infer<typeof TripQuerySchema>) => {
    const response = await axios.get(`${BASE_URL}/trips`, { params });
    return response.data;
  },

  // --- 5. CONTRACTS ---
  signContract: async (bookingId: string, dto: SignContractInput) => {
    const response = await axios.post(`${BASE_URL}/contracts/${bookingId}/sign`, dto);
    return response.data;
  },

  // --- 6. WALLET ---
  requestRefund: async (dto: WalletRefundInput) => {
    const response = await axios.post(`${BASE_URL}/wallet/refund`, dto);
    return response.data;
  },

  // Wallet
  getWallet: async () => {
    const res = await axios.get(`${BASE_URL}/wallet`);
    return res.data;
  },

  getWalletTransactions: async (params?: { page?: number; limit?: number }) => {
    const res = await axios.get(`${BASE_URL}/wallet/transactions`, { params });
    return res.data;
  },

  createWalletTopup: async (dto: CreateWalletTopupInput) => {
    const res = await axios.post(`${BASE_URL}/wallet/topup`, dto);
    return res.data;
  },

  // --- 7. REVIEWS ---
  createReview: async (dto: CreateReviewInput) => {
    const response = await axios.post(`${BASE_URL}/reviews`, dto);
    return response.data;
  },

  getActivePromotions: async () => {
    const response = await axios.get(`${BASE_URL}/promotions`);
    return response.data;
  },

  applyPromotion: async (dto: ApplyPromotionInput) => {
    const response = await axios.post(`${BASE_URL}/promotions/apply`, dto);
    return response.data;
  },
};
