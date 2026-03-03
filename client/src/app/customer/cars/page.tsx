"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Car,
  Calendar,
  Loader2,
  Star,
  AlertCircle,
  ChevronRight,
  Info,
  FilterX,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Đảm bảo bạn đã cài shadcn dialog
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://elitedrive-demoversion.onrender.com";

export default function RentCarPage() {
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return { startDate: formatDate(today), endDate: formatDate(tomorrow) };
  });

  // Booking States
  const [carToBook, setCarToBook] = useState<any>(null); // Xe đang được chọn để xem xét
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở Modal xác nhận
  const [bookingData, setBookingData] = useState<any>(null); // Data trả về từ API sau khi đặt thành công
  const [showConfirm, setShowConfirm] = useState(false); // Trạng thái hiển thị màn hình Success

  const handleSearch = useCallback(
    async (isInitial = false) => {
      if (isInitial) setInitialLoading(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(searchQuery);
        const response = await fetch(`${API_BASE}/api/cars?${params}`);
        const res = await response.json();
        setCars(res.data || []);
        if (res.data?.length === 0) setError("Không có xe nào khả dụng.");
      } catch (err: any) {
        setError("Lỗi kết nối hệ thống.");
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    handleSearch(true);
  }, []);

  const calculateDays = () => {
    const start = new Date(searchQuery.startDate);
    const end = new Date(searchQuery.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return diff <= 0 ? 1 : diff;
  };

  // Bước 1: Mở form xác nhận
  const openConfirmModal = (car: any) => {
    const token = Cookies.get("token");
    if (!token) return toast.error("Vui lòng đăng nhập trước khi đặt xe");
    setCarToBook(car);
    setIsModalOpen(true);
  };

  // Bước 2: Thực sự gọi API đặt xe
  const handleFinalBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/customer/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          carId: carToBook.id,
          startDate: searchQuery.startDate,
          endDate: searchQuery.endDate,
          pickupLocation: carToBook.location?.name || "Hồ Chí Minh",
          dropoffLocation: carToBook.location?.name || "Hồ Chí Minh",
        }),
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.message);

      setBookingData(res.data);
      setIsModalOpen(false);
      setShowConfirm(true);
      toast.success("Đặt xe thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header (Giữ nguyên) */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black italic text-primary uppercase">Elite Drive</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={!showConfirm ? "default" : "outline"}>1. Chọn xe</Badge>
            <ChevronRight className="h-4 w-4 opacity-20" />
            <Badge variant={showConfirm ? "default" : "outline"}>2. Hoàn tất</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {!showConfirm ? (
          <div className="space-y-8">
            {/* Search Panel (Giữ nguyên) */}
            <Card className="border-none shadow-2xl ring-1 ring-border rounded-[2.5rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Ngày nhận
                  </label>
                  <Input
                    type="date"
                    value={searchQuery.startDate}
                    onChange={(e) => setSearchQuery({ ...searchQuery, startDate: e.target.value })}
                    className="rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Ngày trả
                  </label>
                  <Input
                    type="date"
                    value={searchQuery.endDate}
                    onChange={(e) => setSearchQuery({ ...searchQuery, endDate: e.target.value })}
                    className="rounded-xl font-bold"
                  />
                </div>
                <Button onClick={() => handleSearch()} className="h-12 mt-auto rounded-xl font-black uppercase">
                  Tìm kiếm
                </Button>
              </div>
            </Card>

            {/* Car Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {initialLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-80 rounded-[2rem]" />)
                : cars.map((car) => (
                    <Card
                      key={car.id}
                      className="rounded-[2rem] overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all ring-1 ring-border">
                      <div className="relative h-56">
                        <Image
                          src={car.mainImageUrl || "/placeholder-car.png"}
                          alt={car.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                      <CardHeader className="p-6">
                        <CardTitle className="text-xl font-bold">{car.name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {car.transmission || "Auto"}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {car.seatCount} Ghế
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 flex justify-between items-center pb-6">
                        <p className="text-2xl font-black text-primary">
                          {car.pricePerDay?.toLocaleString()} ₫{" "}
                          <span className="text-[10px] text-muted-foreground">/ngày</span>
                        </p>
                        <Button
                          size="sm"
                          onClick={() => openConfirmModal(car)}
                          className="rounded-xl font-bold uppercase">
                          Thuê
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        ) : (
          /* MÀN HÌNH THÀNH CÔNG (Sau khi đã có bookingData) */
          <div className="max-w-xl mx-auto py-10 animate-in zoom-in-95">
            <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-none">
              <div className="bg-primary p-12 text-center text-primary-foreground">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black uppercase italic">Đặt xe thành công!</h2>
                <p className="text-[10px] font-mono mt-2 tracking-widest opacity-80">
                  MÃ ĐƠN: #{bookingData?.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <CardContent className="p-10 space-y-6">
                <div className="bg-muted p-6 rounded-2xl border flex justify-between">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Tổng thanh toán</span>
                  <span className="font-black text-xl text-primary">{bookingData?.totalPrice?.toLocaleString()} ₫</span>
                </div>
                <Button
                  className="w-full h-14 rounded-2xl font-black uppercase"
                  onClick={() => (window.location.href = "/customer/bookings")}>
                  Quản lý đơn hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN - ĐÂY LÀ "FORM XÁC NHẬN" BẠN CẦN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-primary-foreground">
            <DialogTitle className="text-2xl font-black uppercase italic">Xác nhận đặt xe</DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-xs">
              Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-border shadow-sm">
                <Image
                  src={carToBook?.mainImageUrl || "/placeholder-car.png"}
                  alt="car"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h4 className="font-bold text-lg">{carToBook?.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {carToBook?.location?.name || "Hồ Chí Minh"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Nhận xe
                </p>
                <p className="text-sm font-bold">{searchQuery.startDate}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-end">
                  Trả xe <Clock className="w-3 h-3" />
                </p>
                <p className="text-sm font-bold">{searchQuery.endDate}</p>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-muted-foreground">Thời gian thuê:</span>
                <span className="text-xs font-bold text-primary">{calculateDays()} ngày</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-primary">Tổng tạm tính:</span>
                <span className="text-xl font-black text-primary">
                  {(carToBook?.pricePerDay * calculateDays()).toLocaleString()} ₫
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-muted/30 pt-4 flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleFinalBooking}
              disabled={loading}
              className="rounded-xl font-black uppercase px-8 shadow-lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Xác nhận đặt xe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
