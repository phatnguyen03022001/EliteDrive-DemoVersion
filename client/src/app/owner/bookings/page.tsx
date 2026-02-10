"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Calendar, User, Car as CarIcon, Loader2, Phone, Info, MapPin } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

/* ================= TYPES ================= */
type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string; // Trạng thái vận hành (CONFIRMED, PICKED_UP, COMPLETED,...)
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED"; // Trạng thái chủ xe duyệt
  car?: { name: string; licensePlate: string };
  customer?: { firstName: string; lastName: string; phone: string };
  payments?: { status: string; amount: number }[];
};

const OWNER_API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/owner`;

export default function OwnerBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Dựa trên VerificationStatus
  const [processingId, setProcessingId] = useState<string | null>(null);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({ baseURL: OWNER_API_BASE });
    instance.interceptors.request.use((config) => {
      const token = Cookies.get("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/bookings", {
        // Backend của bạn dùng query.status, không phải verificationStatus
        params: {
          status: filterStatus,
          limit: 10,
          page: 1,
        },
      });
      setBookings(res.data?.data ?? []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Hàm helper hiển thị nhãn trạng thái vận hành
  const getOperatingStatus = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Chờ khách cọc", color: "bg-orange-100 text-orange-700 border-orange-200" },
      CONFIRMED: { label: "Chờ khách nhận xe", color: "bg-blue-100 text-blue-700 border-blue-200" },
      PICKED_UP: { label: "Đang thuê", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
      COMPLETED: { label: "Đã hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
    };
    return map[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  };

  const handleAction = async (bookingId: string, action: "approve" | "reject") => {
    const confirmMsg = action === "approve" ? "Duyệt yêu cầu thuê xe này?" : "Từ chối yêu cầu này?";
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(bookingId);
    try {
      let body = {};
      if (action === "reject") {
        const reason = window.prompt("Lý do từ chối (Gửi cho khách):");
        if (reason === null) return;
        body = { reason: reason || "Chủ xe bận vào thời gian này" };
      }
      await axiosInstance.post(`/bookings/${bookingId}/${action}`, body);
      toast.success(action === "approve" ? "Đã duyệt đơn" : "Đã từ chối đơn");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xử lý");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đặt xe</h1>
          <p className="text-muted-foreground text-sm">Quản lý duyệt đơn và theo dõi trạng thái chuyến đi.</p>
        </div>

        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
            <TabsTrigger value="PENDING">Yêu cầu mới</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Đã duyệt</TabsTrigger>
            <TabsTrigger value="COMPLETED">Hoàn thành</TabsTrigger>
            <TabsTrigger value="REJECTED">Đã từ chối</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center py-20 bg-muted/10">
          <Info className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Không tìm thấy yêu cầu nào ở mục này.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const opStatus = getOperatingStatus(booking.status);
            return (
              <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary">
                <div className="flex flex-col lg:flex-row">
                  <CardHeader className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                          <CarIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{booking.car?.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">{booking.car?.licensePlate}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${opStatus.color} border shadow-none`}>{opStatus.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {booking.customer?.firstName} {booking.customer?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-primary">{booking.customer?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm md:col-span-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(booking.startDate).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(booking.endDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="bg-muted/20 p-6 lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Doanh thu dự kiến</p>
                        <p className="text-2xl font-bold text-primary">
                          {booking.totalPrice?.toLocaleString("vi-VN")}đ
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${booking.payments?.some((p) => p.status === "COMPLETED") ? "bg-green-500" : "bg-orange-400"}`}
                        />
                        <span className="text-xs font-medium">
                          {booking.payments?.some((p) => p.status === "COMPLETED")
                            ? "Đã đặt cọc Escrow"
                            : "Chờ thanh toán"}
                        </span>
                      </div>
                    </div>

                    {filterStatus === "PENDING" && (
                      <div className="flex flex-col gap-2 mt-6">
                        <Button
                          onClick={() => handleAction(booking.id, "approve")}
                          disabled={!!processingId}
                          className="w-full bg-emerald-600 hover:bg-emerald-700">
                          {processingId === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Đồng ý thuê
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAction(booking.id, "reject")}
                          disabled={!!processingId}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50">
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
