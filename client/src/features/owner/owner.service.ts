// src/services/owner/owner.service.ts
import axios from "@/lib/axios";
import {
  CreateCarInput,
  UpdateCarInput,
  CreateCarDocumentInput,
  CreatePricingInput,
  BlockCalendarInput,
  TripCheckinInput,
  TripCheckoutInput,
  RejectBookingInput,
  WithdrawRequestInput,
  UpdateOwnerProfileInput,
  CreateKYCInput,
} from "./owner.schema";

const BASE_URL = "/api/owner";

export const OwnerService = {
  // ==================== 1. PROFILE ====================
  getProfile: async () => {
    const response = await axios.get(`${BASE_URL}/profile`);
    return response.data;
  },

  updateProfile: async (dto: UpdateOwnerProfileInput) => {
    const response = await axios.put(`${BASE_URL}/profile`, dto);
    return response.data;
  },

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

  // ==================== 2. CAR MANAGEMENT ====================
  createCar: async (formData: FormData) => {
    const response = await axios.post(`${BASE_URL}/cars`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getMyCars: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${BASE_URL}/cars`, { params });
    return response.data;
  },

  updateCar: async (carId: string, data: UpdateCarInput | FormData) => {
    // Trường hợp gửi FormData (Có kèm ảnh)
    if (data instanceof FormData) {
      const response = await axios.put(`${BASE_URL}/cars/${carId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    // Trường hợp gửi JSON (Chỉ sửa text)
    const response = await axios.put(`${BASE_URL}/cars/${carId}`, data);
    return response.data;
  },

  deleteCar: async (carId: string) => {
    const response = await axios.delete(`${BASE_URL}/cars/${carId}`);
    return response.data;
  },

  submitCarForReview: async (carId: string) => {
    const response = await axios.post(`${BASE_URL}/cars/${carId}/submit-review`);
    return response.data;
  },

  // ==================== 3. DOCUMENTS & PRICING ====================
  addCarDocument: async (carId: string, dto: CreateCarDocumentInput) => {
    const response = await axios.post(`${BASE_URL}/cars/${carId}/documents`, dto);
    return response.data;
  },

  getCarDocuments: async (carId: string) => {
    const response = await axios.get(`${BASE_URL}/cars/${carId}/documents`);
    return response.data;
  },

  addPricing: async (carId: string, dto: CreatePricingInput) => {
    const response = await axios.post(`${BASE_URL}/cars/${carId}/pricing`, dto);
    return response.data;
  },

  // ==================== 4. CALENDAR ====================
  blockCalendar: async (carId: string, dto: BlockCalendarInput) => {
    const response = await axios.post(`${BASE_URL}/cars/${carId}/calendar/block`, dto);
    return response.data;
  },

  getCalendar: async (carId: string, params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${BASE_URL}/cars/${carId}/calendar`, { params });
    return response.data;
  },

  // ==================== 5. BOOKINGS ====================
  getBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await axios.get(`${BASE_URL}/bookings`, { params });
    return response.data;
  },

  approveBooking: async (bookingId: string) => {
    const response = await axios.post(`${BASE_URL}/bookings/${bookingId}/approve`);
    return response.data;
  },

  rejectBooking: async (bookingId: string, dto: RejectBookingInput) => {
    const response = await axios.post(`${BASE_URL}/bookings/${bookingId}/reject`, dto);
    return response.data;
  },

  // ==================== 6. TRIPS ====================
  getTrips: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${BASE_URL}/trips`, { params });
    return response.data;
  },

  checkinTrip: async (tripId: string, dto: TripCheckinInput) => {
    const response = await axios.post(`${BASE_URL}/trips/${tripId}/checkin`, dto);
    return response.data;
  },

  checkoutTrip: async (tripId: string, dto: TripCheckoutInput) => {
    const response = await axios.post(`${BASE_URL}/trips/${tripId}/checkout`, dto);
    return response.data;
  },

  // ==================== 7. FINANCE ====================
  getEarnings: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${BASE_URL}/finance/earnings`, { params });
    return response.data;
  },

  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const response = await axios.get(`${BASE_URL}/finance/transactions`, { params });
    return response.data;
  },

  requestWithdraw: async (dto: WithdrawRequestInput) => {
    const response = await axios.post(`${BASE_URL}/finance/withdraw`, dto);
    return response.data;
  },

  // ==================== 8. WALLET ====================
  getWallet: async () => {
    const response = await axios.get(`${BASE_URL}/wallet`);
    return response.data;
  },

  // ==================== 9. DASHBOARD ====================
  getDashboardOverview: async () => {
    const response = await axios.get(`${BASE_URL}/dashboard/overview`);
    return response.data;
  },

  // ==================== 10. DISPUTE ====================
  respondDispute: async (disputeId: string, message: string) => {
    const response = await axios.post(`${BASE_URL}/disputes/${disputeId}/respond`, { message });
    return response.data;
  },
};
