"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import Image from "next/image";

// Shadcn UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WithdrawRequest {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed"; // JSON trả về chữ thường
  description: string;
  metadata: {
    bankAccountNumber: string;
    bankAccountName: string;
  };
  createdAt: string;
  owner: {
    // Trong JSON là "owner", không phải "user"
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
}

export default function AdminWithdrawPage() {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/withdraws/pending");

      // Dựa trên log: res.data đã là object {items, total...}
      // Nên actualData sẽ lấy từ res.data.items
      const actualData = res.data?.items || [];

      setRequests(actualData);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  const handleProcessAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === "approve") {
        await api.post(`/api/admin/withdraws/${selectedRequest.id}/approve`);
      } else {
        await api.post(`/api/admin/withdraws/${selectedRequest.id}/reject`, {
          reason: rejectReason,
        });
      }

      // Reset & Refresh
      closeModal();
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setRejectReason("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phê duyệt rút tiền</h1>
          <p className="text-muted-foreground">Quản lý các yêu cầu rút tiền từ ví của chủ xe.</p>
        </div>
        {!loading && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {requests.length} Yêu cầu đang chờ
          </Badge>
        )}
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Chủ xe</TableHead>
                <TableHead>Thông tin ngân hàng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Ngày yêu cầu</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Hiển thị Skeleton khi đang tải
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                          <Image
                            src={req.owner.avatar || "/default-avatar.png"}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized // Thêm cái này nếu avatar từ localhost/IP lạ chưa config domain trong next.config.js
                          />
                        </div>
                        <div>
                          <div className="font-medium leading-none">
                            {req.owner.firstName} {req.owner.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{req.owner.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-semibold text-blue-600 uppercase">
                        {req.metadata?.bankAccountName}
                      </div>
                      <div className="text-xs font-mono font-bold">{req.metadata?.bankAccountNumber}</div>
                    </TableCell>

                    <TableCell className="font-bold text-slate-900">{req.amount.toLocaleString("vi-VN")}đ</TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      {/* Buttons giữ nguyên logic của bạn */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("reject");
                        }}>
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("approve");
                        }}>
                        Duyệt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    🎉 Tuyệt vời! Không còn yêu cầu nào cần xử lý.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Xác nhận Action */}
      <Dialog open={!!actionType} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Xác nhận chuyển khoản" : "Từ chối yêu cầu"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Bạn xác nhận đã chuyển khoản số tiền ${selectedRequest?.amount.toLocaleString()}đ cho ${selectedRequest?.metadata?.bankAccountName}?`
                : `Vui lòng nhập lý do từ chối yêu cầu rút tiền này.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="py-4">
              <Input
                placeholder="Lý do: Thông tin ngân hàng không chính xác..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleProcessAction}
              disabled={actionType === "reject" && !rejectReason}>
              Xác nhận {actionType === "approve" ? "Đã chuyển" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
