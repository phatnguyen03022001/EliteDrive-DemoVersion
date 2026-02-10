"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";

// Shadcn UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpRight, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: "VNPAY" | "WALLET";
  transactionId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paidAt: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  booking?: {
    id: string;
    totalPrice: number;
    status: string;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/api/admin/payments");
        setPayments(res.data || []);
      } catch (error) {
        console.error("Lỗi fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Thành công
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-200">
            <Clock className="w-3 h-3 mr-1" /> Chờ xử lý
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Thất bại
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử Giao dịch</h1>
          <p className="text-muted-foreground">Theo dõi toàn bộ dòng tiền nạp vào hệ thống qua VNPAY.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo email hoặc mã giao dịch..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Mã giao dịch (VNPAY)</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Booking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">
                        {payment.user?.firstName} {payment.user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{payment.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{payment.transactionId || "---"}</code>
                    </TableCell>
                    <TableCell className="font-bold text-base">{payment.amount.toLocaleString()}đ</TableCell>
                    <TableCell className="text-sm">{format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      {payment.booking ? (
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                          #{payment.booking.id.slice(-6).toUpperCase()} <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && filteredPayments.length === 0 && (
            <div className="text-center py-20 text-muted-foreground italic">Không tìm thấy giao dịch nào phù hợp.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
