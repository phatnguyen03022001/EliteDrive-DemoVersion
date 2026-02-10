// src/services/admin/admin.queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "./admin.service";
import {
  ReportDateRangeInput,
  AdminKYCQueryInput,
  RejectKYCInput,
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionQueryInput,
  ReleasePaymentInput,
  RefundPaymentInput,
  RunSettlementInput,
  SettlementHistoryQueryInput,
  ResolveDisputeInput,
  DisputeQueryInput,
  WithdrawQueryInput,
  RejectWithdrawInput,
  CreateCategoryInput,
  CreateLocationInput,
} from "./admin.schema";

// ==================== QUERY KEYS ====================
export const adminKeys = {
  all: ["admin"] as const,

  // Reports
  reports: () => [...adminKeys.all, "reports"] as const,
  overview: () => [...adminKeys.reports(), "overview"] as const,
  bookings: (params: any) => [...adminKeys.reports(), "bookings", params] as const,
  revenue: (params: any) => [...adminKeys.reports(), "revenue", params] as const,

  // KYC
  kyc: () => [...adminKeys.all, "kyc"] as const,
  kycList: (params: any) => [...adminKeys.kyc(), "list", params] as const,

  // Cars
  cars: () => [...adminKeys.all, "cars"] as const,
  carList: (params: any) => [...adminKeys.cars(), "list", params] as const,
  pendingCars: () => [...adminKeys.cars(), "pending"] as const,

  // Promotions
  promotions: (params: any) => [...adminKeys.all, "promotions", params] as const,

  // Escrow
  escrow: () => [...adminKeys.all, "escrow"] as const,
  escrowSummary: () => [...adminKeys.escrow(), "summary"] as const,
  pendingRelease: (params: any) => [...adminKeys.escrow(), "pending-release", params] as const,

  // Settlements
  settlements: (params: any) => [...adminKeys.all, "settlements", params] as const,

  // Disputes
  disputes: (params: any) => [...adminKeys.all, "disputes", params] as const,

  // Withdrawals
  withdraws: (params: any) => [...adminKeys.all, "withdraws", params] as const,

  // Platform
  platformWallet: () => [...adminKeys.all, "platform-wallet"] as const,

  // Users
  users: (params: any) => [...adminKeys.all, "users", params] as const,

  // Audit
  auditLogs: (params: any) => [...adminKeys.all, "audit-logs", params] as const,
};

// ==================== 1. REPORTS & ANALYTICS ====================
export const useOverviewReport = () => {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: AdminService.getOverviewReport,
  });
};

export const useBookingsReport = (params: ReportDateRangeInput) => {
  return useQuery({
    queryKey: adminKeys.bookings(params),
    queryFn: () => AdminService.getBookingsReport(params),
  });
};

export const useRevenueReport = (params: ReportDateRangeInput) => {
  return useQuery({
    queryKey: adminKeys.revenue(params),
    queryFn: () => AdminService.getRevenueReport(params),
  });
};

// ==================== 2. KYC MANAGEMENT ====================
export const useKycCustomers = (params: AdminKYCQueryInput) => {
  return useQuery({
    queryKey: ["admin", "kyc", "list", params],
    queryFn: async () => {
      const response = await AdminService.getKycCustomers(params);

      // LOG ĐỂ KIỂM TRA CHÍNH XÁC CẤU TRÚC
      console.log("Response từ Service:", response);

      // Nếu JSON của bạn là { items: [...], total: 2 }, hãy trả về thẳng 'response'
      // Nếu JSON là { data: { items: [...] } }, hãy trả về 'response.data'

      // Giả sử AdminService trả về toàn bộ Object JSON bạn vừa gửi:
      const result = response.items ? response : response.data;

      if (!result || !result.items) {
        return { items: [], total: 0, page: 1, limit: 10 };
      }

      return result;
    },
  });
};

export const useApproveKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Đảm bảo nhận vào một object { userId: string }
    mutationFn: ({ userId }: { userId: string }) => AdminService.approveKyc(userId),
    onSuccess: () => {
      // Refresh lại danh sách sau khi approve thành công
      queryClient.invalidateQueries({ queryKey: adminKeys.kyc() });
    },
  });
};
export const useRejectKyc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: RejectKYCInput }) => AdminService.rejectKyc(userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.kyc() });
    },
  });
};

// ==================== 3. CAR APPROVAL ====================
export const usePendingCars = () => {
  return useQuery({
    queryKey: adminKeys.pendingCars(),
    queryFn: AdminService.getPendingCars,
  });
};

export const useAllCars = (params: { status?: string; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: adminKeys.carList(params),
    queryFn: () => AdminService.getAllCars(params),
  });
};

export const useApproveCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (carId: string) => AdminService.approveCar(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingCars() });
    },
  });
};

export const useRejectCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ carId, reason }: { carId: string; reason: string }) => AdminService.rejectCar(carId, reason), // Đảm bảo AdminService đã có method này
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingCars() });
    },
  });
};

// ==================== 4. PROMOTIONS ====================
export const usePromotions = (params: PromotionQueryInput = {}) => {
  return useQuery({
    queryKey: adminKeys.promotions(params),
    queryFn: () => AdminService.getPromotions(params),
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePromotionInput) => AdminService.createPromotion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePromotionInput }) => AdminService.updatePromotion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// ==================== 5. ESCROW MANAGEMENT ====================
export const useEscrowSummary = () => {
  return useQuery({
    queryKey: adminKeys.escrowSummary(),
    queryFn: AdminService.getEscrowSummary,
    refetchInterval: 30000, // Auto refresh every 30s
  });
};

export const usePendingReleaseTrips = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: adminKeys.pendingRelease(params),
    queryFn: () => AdminService.getPendingReleaseTrips(params),
  });
};

export const useReleasePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ReleasePaymentInput) => AdminService.releasePayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrow() });
      queryClient.invalidateQueries({ queryKey: adminKeys.platformWallet() });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RefundPaymentInput) => AdminService.refundPayment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrow() });
      queryClient.invalidateQueries({ queryKey: adminKeys.platformWallet() });
    },
  });
};

export const useAutoReleasePayments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminService.autoReleasePayments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.escrow() });
      queryClient.invalidateQueries({ queryKey: adminKeys.platformWallet() });
    },
  });
};

// ==================== 6. SETTLEMENTS ====================
export const useRunSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RunSettlementInput) => AdminService.runSettlement(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useSettlementHistory = (params: SettlementHistoryQueryInput = {}) => {
  return useQuery({
    queryKey: adminKeys.settlements(params),
    queryFn: () => AdminService.getSettlementHistory(params),
  });
};

// ==================== 7. DISPUTES ====================
export const useDisputes = (params: DisputeQueryInput = {}) => {
  return useQuery({
    queryKey: adminKeys.disputes(params),
    queryFn: () => AdminService.getDisputes(params),
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, dto }: { disputeId: string; dto: ResolveDisputeInput }) =>
      AdminService.resolveDispute(disputeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.disputes({}) });
    },
  });
};

// ==================== 8. WITHDRAWALS ====================
export const usePendingWithdraws = (params: WithdrawQueryInput = {}) => {
  return useQuery({
    queryKey: adminKeys.withdraws(params),
    queryFn: () => AdminService.getPendingWithdraws(params),
  });
};

export const useApproveWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.approveWithdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.withdraws({}) });
      queryClient.invalidateQueries({ queryKey: adminKeys.platformWallet() });
    },
  });
};

export const useRejectWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectWithdrawInput }) => AdminService.rejectWithdraw(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.withdraws({}) });
    },
  });
};

// ==================== 9. MASTER DATA ====================
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryInput) => AdminService.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocationInput) => AdminService.createLocation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

// ==================== 10. PLATFORM WALLET ====================
export const usePlatformWallet = () => {
  return useQuery({
    queryKey: adminKeys.platformWallet(),
    queryFn: AdminService.getPlatformWallet,
    refetchInterval: 60000, // Auto refresh every 60s
  });
};

// ==================== 11. USERS ====================
export const useUsers = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => AdminService.getUsers(params),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "ACTIVE" | "INACTIVE" }) =>
      AdminService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users({}) });
    },
  });
};

// ==================== 12. AUDIT ====================
export const useAuditLogs = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => AdminService.getAuditLogs(params),
  });
};
