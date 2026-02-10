// app/owner/finance/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Wallet, ArrowUpRight, ArrowDownLeft, History, RefreshCcw, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// ── Query Keys ─────────────────────────────────────
const ownerKeys = {
  wallet: ["owner", "wallet"] as const,
  transactions: (limit = 10) => ["owner", "transactions", limit] as const,
};

// ── Fetchers ───────────────────────────────────────
const fetchWallet = () => api.get("/api/owner/wallet").then((r) => r.data?.data || r.data);
const fetchTransactions = () =>
  api.get("/api/owner/finance/transactions?limit=10").then((r) => r.data?.data || r.data || []);

// ── Mutation ───────────────────────────────────────
const useWithdrawMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/api/owner/finance/withdraw", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ownerKeys.wallet });
      qc.invalidateQueries({ queryKey: ownerKeys.transactions() });
    },
  });
};

// ── Main Page ──────────────────────────────────────
export default function OwnerFinancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ownerKeys.wallet,
    queryFn: fetchWallet,
    staleTime: 60_000,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ownerKeys.transactions(),
    queryFn: fetchTransactions,
    staleTime: 60_000,
  });

  const withdrawMut = useWithdrawMutation();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const isLoading = walletLoading || txLoading;

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tài chính</h1>
          <p className="text-muted-foreground">Theo dõi thu nhập và rút tiền dễ dàng</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries()} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          <span className="ml-2">Làm mới</span>
        </Button>
      </div>

      {/* Balance + Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-primary text-primary-foreground shadow-2xl border-none overflow-hidden relative">
          <CardHeader className="relative z-10">
            <CardDescription className="text-primary-foreground/80">Số dư khả dụng</CardDescription>
            <CardTitle className="text-5xl font-bold tracking-tighter">
              {isLoading ? "..." : formatCurrency(wallet?.balance || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="font-semibold shadow-md">
                  Rút tiền ngay
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yêu cầu rút tiền</DialogTitle>
                  <DialogDescription>Nhập thông tin ngân hàng để nhận tiền</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);

                    withdrawMut.mutate(
                      {
                        amount: Number(formData.get("amount")),
                        bankAccountNumber: formData.get("bankNo"),
                        bankAccountName: (formData.get("bankName") as string)?.toUpperCase(),
                        description: formData.get("desc") as string,
                      },
                      {
                        onSuccess: () => {
                          setOpen(false);
                          // qc.invalidateQueries(); // refresh ngay nếu cần
                        },
                        // onError: (err) => toast.error("Lỗi: " + err.message), // tùy chọn
                      },
                    );
                  }}
                  className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Số tiền rút (VND)</Label>
                    <Input id="amount" name="amount" type="number" min="10000" placeholder="1000000" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankNo">Số tài khoản</Label>
                    <Input id="bankNo" name="bankNo" placeholder="1903..." required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input id="bankName" name="bankName" placeholder="VIETCOMBANK" className="uppercase" required />
                  </div>

                  {/* Nếu có thêm mô tả */}
                  {/* <div className="space-y-2">
    <Label htmlFor="desc">Ghi chú (tùy chọn)</Label>
    <Input id="desc" name="desc" placeholder="Rút tiền tháng này" />
  </div> */}

                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full" disabled={withdrawMut.isPending}>
                      {withdrawMut.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        "Gửi yêu cầu"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
          <div className="absolute top-[-20%] right-[-10%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </Card>

        <Card className="flex flex-col justify-center border-dashed">
          <CardHeader className="pb-2">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <CardDescription>Giao dịch gần nhất</CardDescription>
            <CardTitle className="text-3xl">{transactions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-5 w-5" /> Lịch sử giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Chưa có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tx.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "WITHDRAW" ? "outline" : "secondary"}>
                        {tx.type === "RENTAL_INCOME" ? "Thu nhập" : tx.type === "REFUND" ? "Hoàn tiền" : "Rút tiền"}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(tx.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          tx.status === "completed" ? "default" : tx.status === "pending" ? "outline" : "destructive"
                        }>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
