"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { CalendarIcon, Car, CheckCircle2, Lock, Unlock, Loader2, Info } from "lucide-react";
import { toast } from "sonner"; // Sử dụng toast thay vì Toaster component

// Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interfaces
interface CarItem {
  id: string;
  name: string;
  licensePlate: string;
  verificationStatus: string;
}

interface Availability {
  date: string;
  isAvailable: boolean;
}

export default function OwnerCalendarPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [calendar, setCalendar] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data: res } = await api.get("/api/owner/cars");
      const approved = res.data.filter((c: any) => c.verificationStatus === "APPROVED");
      setCars(approved);
      if (approved.length > 0) setSelectedCar(approved[0]);
    } catch (error) {
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async (carId: string) => {
    try {
      const start = new Date();
      const end = new Date();
      // Thay đổi số 11 thành 29 để lấy tổng cộng 30 ngày (từ hôm nay)
      end.setDate(start.getDate() + 29);

      const { data: res } = await api.get(`/api/owner/cars/${carId}/calendar`, {
        params: {
          start_date: start.toISOString().split("T")[0],
          end_date: end.toISOString().split("T")[0],
        },
      });

      setCalendar(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedCar) fetchCalendar(selectedCar.id);
  }, [selectedCar]);

  const toggleAvailability = async (date: string, currentStatus: boolean) => {
    if (!selectedCar) return;

    setActionLoading(date);

    // Sử dụng toast.promise để hiển thị trạng thái loading/success/error cực đẹp
    const updatePromise = api.post(`/api/owner/cars/${selectedCar.id}/calendar/block`, {
      date,
      isBlocked: currentStatus,
      blockedReason: currentStatus ? "Chủ xe bận" : null,
    });

    toast.promise(updatePromise, {
      loading: "Đang cập nhật lịch...",
      success: () => {
        fetchCalendar(selectedCar.id);
        return `Đã cập nhật trạng thái ngày ${date}`;
      },
      error: "Cập nhật thất bại, vui lòng thử lại.",
    });

    try {
      await updatePromise;
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CalendarIcon className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch xe sẵn sàng</h1>
          <p className="text-sm text-muted-foreground">Chỉ hiển thị những xe đã được admin duyệt (APPROVED)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar: Danh sách xe */}
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader className="px-4 py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Xe của bạn</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-1">
                {cars.map((car) => (
                  <Button
                    key={car.id}
                    variant={selectedCar?.id === car.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-14"
                    onClick={() => setSelectedCar(car)}>
                    <Car size={18} className={selectedCar?.id === car.id ? "text-primary" : "text-muted-foreground"} />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-semibold truncate w-full">{car.name}</span>
                      <span className="text-xs text-muted-foreground">{car.licensePlate}</span>
                    </div>
                  </Button>
                ))}
                {cars.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Không có xe nào khả dụng hoặc đang chờ duyệt.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main: Quản lý lịch */}
        <Card className="md:col-span-8 lg:col-span-9">
          {selectedCar ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b mb-6">
                <div>
                  <CardTitle className="text-xl font-bold">{selectedCar.name}</CardTitle>
                  <CardDescription className="mb-4">Click vào từng ngày để khóa hoặc mở lịch phục vụ</CardDescription>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600 gap-1 uppercase text-[10px]">
                  <CheckCircle2 size={12} /> Approved
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Thêm h-[500px] và ScrollArea nếu muốn giới hạn chiều cao, hoặc để tự nhiên */}
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {[...Array(30)].map((_, i) => {
                      const dateObj = new Date();
                      dateObj.setDate(dateObj.getDate() + i);
                      const dateStr = dateObj.toISOString().split("T")[0];
                      const dayData = calendar.find((c) => c.date.startsWith(dateStr));
                      const isAvailable = dayData ? dayData.isAvailable : true;
                      const isProcessing = actionLoading === dateStr;

                      return (
                        <div
                          key={dateStr}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                            isAvailable ? "border-border" : "border-red-100 bg-red-50/30"
                          }`}>
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">
                              {dateObj.toLocaleDateString("vi-VN", { weekday: "short" })}
                            </p>
                            <p className="text-md font-black">
                              {dateObj.getDate()}/{dateObj.getMonth() + 1}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant={isAvailable ? "outline" : "destructive"}
                            className="w-full h-8 text-[9px] uppercase font-bold"
                            disabled={!!actionLoading}
                            onClick={() => toggleAvailability(dateStr, isAvailable)}>
                            {isProcessing ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isAvailable ? (
                              <Unlock size={12} className="mr-1 text-green-500" />
                            ) : (
                              <Lock size={12} className="mr-1" />
                            )}
                            {isAvailable ? "Trống" : "Khóa"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Vui lòng chọn xe từ danh sách bên trái để thiết lập lịch.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Skeleton className="md:col-span-3 h-[500px] rounded-xl" />
        <Skeleton className="md:col-span-9 h-[500px] rounded-xl" />
      </div>
    </div>
  );
}
