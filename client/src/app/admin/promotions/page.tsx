"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, TicketPercent, Calendar, Users, Trash2 } from "lucide-react";

interface Promotion {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchPromotions = async () => {
    try {
      const res = await api.get("/api/admin/promotions");
      setPromotions(res.data || []);
    } catch (error) {
      console.error("Lỗi fetch khuyến mãi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const getStatusBadge = (promo: Promotion) => {
    const now = new Date();
    const end = new Date(promo.endDate);
    if (!promo.isActive) return <Badge variant="secondary">Tạm dừng</Badge>;
    if (now > end) return <Badge variant="destructive">Hết hạn</Badge>;
    if (promo.usedCount >= promo.usageLimit) return <Badge variant="outline">Hết lượt</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đang chạy</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <TicketPercent className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mã khuyến mãi</h1>
            <p className="text-muted-foreground">Tạo và quản lý các chương trình ưu đãi.</p>
          </div>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Tạo mã mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo chiến dịch khuyến mãi</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã Voucher (Ví dụ: TET2026)</Label>
                <Input id="code" placeholder="Nhập mã..." className="uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Loại giảm giá</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Giá trị giảm</Label>
                  <Input type="number" placeholder="Vd: 10 hoặc 50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Giới hạn sử dụng</Label>
                  <Input type="number" placeholder="Vd: 100" />
                </div>
                <div className="grid gap-2">
                  <Label>Đơn tối thiểu</Label>
                  <Input type="number" placeholder="Vd: 1000000" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu mã khuyến mãi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mã đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.filter((p) => p.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng lượt đã dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.reduce((acc, curr) => acc + curr.usedCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tiền đã giảm (Tháng này)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">12.500.000đ</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã khuyến mãi</TableHead>
                <TableHead>Chi tiết giảm</TableHead>
                <TableHead>Hiệu suất sử dụng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div className="font-bold text-primary flex items-center gap-2">
                      <TicketPercent className="h-4 w-4" /> {promo.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>
                        Giảm {promo.value.toLocaleString()}
                        {promo.type === "PERCENTAGE" ? "%" : "đ"}
                      </p>
                      <p className="text-xs text-muted-foreground">Đơn từ: {promo.minOrderValue.toLocaleString()}đ</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {promo.usedCount}/{promo.usageLimit} lượt
                        </span>
                        <span>{Math.round((promo.usedCount / promo.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(promo.startDate), "dd/MM")}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground underline decoration-dotted italic">
                        Tới {format(new Date(promo.endDate), "dd/MM/yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(promo)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
