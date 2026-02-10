// app/admin/kyc/page.tsx
"use client";

import { useState } from "react";
import { useKycCustomers, useRejectKyc, useApproveKyc } from "@/features/admin/admin.queries";
import { KYCStatus, KYCStatusType, KYCItem } from "@/features/admin/admin.schema";

import { Button } from "@/components/ui/button";
import Image from "next/image";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Calendar } from "lucide-react";

// ────────────────────────────────────────────────
// Reject Dialog
// ────────────────────────────────────────────────
function RejectDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const [reason, setReason] = useState("");
  const rejectMutation = useRejectKyc();

  const handleReject = () => {
    if (!reason.trim()) return;
    rejectMutation.mutate(
      { userId, dto: { rejectionReason: reason.trim() } },
      {
        onSuccess: () => {
          setReason("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Từ chối KYC</DialogTitle>
          <DialogDescription>Vui lòng nhập lý do từ chối để thông báo cho khách hàng.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Lý do từ chối..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || rejectMutation.isPending}>
            {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApproveDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}) {
  const approveMutation = useApproveKyc();

  const handleApprove = () => {
    // Đảm bảo truyền đúng object có chứa userId string
    approveMutation.mutate(
      { userId },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận phê duyệt KYC</DialogTitle>
          <DialogDescription>Bạn có chắc chắn muốn phê duyệt KYC cho khách hàng này không?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={approveMutation.isPending}>
            Hủy
          </Button>
          <Button onClick={handleApprove} disabled={approveMutation.isPending}>
            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Phê duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────
// Actions cho mỗi row
// ────────────────────────────────────────────────
function KycActions({ userId, status }: { userId: string; status: KYCStatusType }) {
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  if (status !== KYCStatus.enum.PENDING) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
        onClick={() => setShowApprove(true)}>
        <CheckCircle2 className="mr-1.5 h-4 w-4" />
        Phê duyệt
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setShowReject(true)}>
        <XCircle className="mr-1.5 h-4 w-4" />
        Từ chối
      </Button>

      <RejectDialog open={showReject} onOpenChange={setShowReject} userId={userId} />
      <ApproveDialog open={showApprove} onOpenChange={setShowApprove} userId={userId} />
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────
export default function AdminKycPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<KYCStatusType | undefined>(undefined);

  const { data, isLoading, isPlaceholderData } = useKycCustomers({
    page,
    limit: 10,
    status,
  });

  // Khớp với JSON: data.items và data.total
  const items = data?.items ?? [];
  const totalItems = Number(data?.total ?? 0);
  const limit = Number(data?.limit ?? 10);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Loại giấy tờ</TableHead>
            <TableHead>Số tài liệu</TableHead>
            <TableHead>Minh chứng</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: KYCItem) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {item.user.firstName} {item.user.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.user.email}</span>
                  <Badge variant="outline" className="w-fit mt-1 text-[10px] scale-90 -ml-1">
                    {item.user.role}
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{item.documentType}</Badge>
              </TableCell>

              <TableCell className="font-mono text-xs">{item.documentNumber}</TableCell>

              <TableCell>
                <div className="flex gap-2">
                  {[
                    { url: item.documentFrontUrl, label: "Mặt trước" },
                    { url: item.documentBackUrl, label: "Mặt sau" },
                    { url: item.faceImageUrl, label: "Chân dung" },
                  ].map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-12 w-12 border rounded-md overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => img.url && window.open(img.url, "_blank")}>
                      {img.url ? (
                        <Image src={img.url} alt={img.label} unoptimized fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[8px] text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.submittedAt).toLocaleDateString("vi-VN")}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  className={
                    item.status === KYCStatus.enum.APPROVED
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : item.status === KYCStatus.enum.REJECTED
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }>
                  {item.status === KYCStatus.enum.PENDING
                    ? "Chờ duyệt"
                    : item.status === KYCStatus.enum.APPROVED
                      ? "Đã duyệt"
                      : "Bị từ chối"}
                </Badge>
                {item.rejectionReason && (
                  <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={item.rejectionReason}>
                    Lý do: {item.rejectionReason}
                  </p>
                )}
              </TableCell>

              <TableCell className="text-right">
                <KycActions userId={item.userId ?? ""} status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center space-x-2 py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isPlaceholderData}>
          Trước
        </Button>

        <div className="text-sm font-medium min-w-[100px] text-center">
          Trang {page} / {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages || isPlaceholderData}>
          Sau
        </Button>
      </div>
    </div>
  );
}
