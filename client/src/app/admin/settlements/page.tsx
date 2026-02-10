// app/admin/settlement/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Shadcn + Icons
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Coins, RotateCcw, Zap, History, CheckCircle2, Loader2 } from "lucide-react";

interface PendingSettlement {
  id: string;
  bookingId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  customerName: string;
  ownerName: string;
  dropoffNotes?: string;
}

interface PaymentHistory {
  id: string;
  bookingId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  customerName: string;
  ownerName: string;
}

// ── Query Keys ──────────────────────────────────────────────────
const settlementKeys = {
  pending: ["admin", "settlement", "pending"] as const,
  history: ["admin", "settlement", "history"] as const,
};

// ── Fetchers ────────────────────────────────────────────────────
const fetchPending = async (): Promise<PendingSettlement[]> => {
  const res = await api.get("/api/admin/escrow/pending-release");
  return (res.data?.items || []).map((item: any) => {
    const total = item.booking?.totalPrice || 0;
    const fee = Math.round(total * 0.2);
    return {
      id: item.id,
      bookingId: item.bookingId,
      amount: total,
      fee,
      netAmount: total - fee,
      status: item.status,
      createdAt: item.createdAt,
      customerName: item.booking?.customer
        ? `${item.booking.customer.firstName} ${item.booking.customer.lastName}`
        : "Khách hàng",
      ownerName: item.car?.owner ? `${item.car.owner.firstName} ${item.car.owner.lastName}` : "Chủ xe",
      dropoffNotes: item.dropoffNotes,
    };
  });
};

const fetchHistory = async (): Promise<PaymentHistory[]> => {
  const res = await api.get("/api/admin/payments");
  return (res.data || []).map((p: any) => ({
    id: p.id,
    bookingId: p.bookingId,
    amount: p.amount,
    fee: Math.round(p.amount * 0.1),
    netAmount: p.amount - Math.round(p.amount * 0.1),
    status: p.status,
    createdAt: p.createdAt,
    customerName: p.user ? `${p.user.firstName} ${p.user.lastName}` : "N/A",
    ownerName: p.booking?.carId ? `Xe ${p.booking.carId.slice(-4)}` : "Hệ thống",
  }));
};

// ── Mutations ───────────────────────────────────────────────────
const useReleaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => api.post("/api/admin/payments/release", { bookingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.pending });
      queryClient.invalidateQueries({ queryKey: settlementKeys.history });
    },
  });
};

const useRefundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      api.post("/api/admin/payments/refund", {
        bookingId,
        reason: "Admin thực hiện hoàn tiền",
        refundPercent: 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.pending });
      queryClient.invalidateQueries({ queryKey: settlementKeys.history });
    },
  });
};

const useAutoReleaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/admin/settlements/auto-release"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.pending });
      queryClient.invalidateQueries({ queryKey: settlementKeys.history });
    },
  });
};

// ── Main Page ───────────────────────────────────────────────────
export default function AdminSettlementPage() {
  const {
    data: pending = [],
    isLoading: pendingLoading,
    isError: pendingError,
  } = useQuery<PendingSettlement[]>({
    queryKey: settlementKeys.pending,
    queryFn: fetchPending,
    staleTime: 45 * 1000,
  });
  const { data: history = [], isLoading: historyLoading } = useQuery<PaymentHistory[]>({
    queryKey: settlementKeys.history,
    queryFn: fetchHistory,
    staleTime: 2 * 60 * 1000,
  });

  const releaseMutation = useReleaseMutation();
  const refundMutation = useRefundMutation();
  const autoReleaseMutation = useAutoReleaseMutation();

  const isLoading = pendingLoading || historyLoading;
  const isMutating = releaseMutation.isPending || refundMutation.isPending || autoReleaseMutation.isPending;

  if (pendingError) {
    return <div className="p-8 text-center text-destructive">Lỗi tải dữ liệu giải ngân. Vui lòng thử lại.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giao dịch & Giải ngân</h1>
          <p className="text-muted-foreground">Quản lý dòng tiền Escrow</p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isMutating || pending.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Giải ngân tự động
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận giải ngân tự động?</AlertDialogTitle>
              <AlertDialogDescription>Hệ thống sẽ chuyển tiền cho tất cả đơn đủ điều kiện.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => autoReleaseMutation.mutate()}>Thực hiện</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="pending">Chờ giải ngân ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-orange-500" />
                Danh sách chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Chủ xe / Khách</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Phí</TableHead>
                      <TableHead>Thực nhận</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          Đang tải...
                        </TableCell>
                      </TableRow>
                    ) : pending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          Không có giao dịch chờ xử lý
                        </TableCell>
                      </TableRow>
                    ) : (
                      pending.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-mono text-xs">{task.bookingId}</TableCell>
                          <TableCell>
                            <p>Chủ: {task.ownerName}</p>
                            <p className="text-xs text-muted-foreground">Khách: {task.customerName}</p>
                          </TableCell>
                          <TableCell>{task.amount.toLocaleString()}₫</TableCell>
                          <TableCell className="text-destructive">-{task.fee.toLocaleString()}₫</TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            {task.netAmount.toLocaleString()}₫
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() => refundMutation.mutate(task.bookingId)}>
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Hoàn tiền
                            </Button>
                            <Button
                              size="sm"
                              disabled={isMutating}
                              onClick={() => releaseMutation.mutate(task.bookingId)}>
                              Giải ngân
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Nhật ký giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Đối tượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs">
                          {format(new Date(h.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{h.status}</Badge>
                        </TableCell>
                        <TableCell>{h.amount.toLocaleString()}₫</TableCell>
                        <TableCell>{h.ownerName}</TableCell>
                        <TableCell className="flex items-center text-emerald-600 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Thành công
                        </TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          Chưa có lịch sử giao dịch
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
