"use client";
import React, { useState } from "react";
import {
  Search,
  Car,
  Calendar,
  MapPin,
  Loader2,
  Star,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";

// UI Components từ shadcn
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "/api/customer";

const callAPI = async (endpoint: string, options: any = {}) => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "API Error");
  return data;
};

export default function RentCarPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState({ startDate: "", endDate: "", locationId: "" });
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const calculateDays = () => {
    if (!searchQuery.startDate || !searchQuery.endDate) return 0;
    const start = new Date(searchQuery.startDate);
    const end = new Date(searchQuery.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    return diff <= 0 ? 1 : diff;
  };

  const handleSearch = async () => {
    if (!searchQuery.startDate || !searchQuery.endDate) {
      setError("Vui lòng chọn đầy đủ ngày nhận và ngày trả xe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: searchQuery.startDate,
        endDate: searchQuery.endDate,
        ...(searchQuery.locationId && { locationId: searchQuery.locationId }),
        page: "1",
        limit: "20",
      });
      const res = await callAPI(`/cars/search?${params}`);
      setCars(res.data || []);
      if (!res.data?.length) setError("Không tìm thấy xe khả dụng trong khu vực và thời gian này.");
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCar = async (car: any) => {
    setLoading(true);
    try {
      const res = await callAPI("/bookings", {
        method: "POST",
        body: JSON.stringify({
          carId: car.id,
          startDate: searchQuery.startDate,
          endDate: searchQuery.endDate,
          pickupLocation: car.location?.name || "Điểm nhận xe",
          dropoffLocation: car.location?.name || "Điểm trả xe",
        }),
      });
      if (res.success) {
        setSelectedCar(car);
        setBookingData(res.data);
        setShowConfirm(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <div className="border-b mb-8">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tìm thuê xe tự lái</h1>
            <p className="mt-1">Hàng ngàn lựa chọn xe đời mới, thủ tục xác thực KYC nhanh chóng.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={!showConfirm ? "default" : "outline"} className="px-4 py-1">
              1. Tìm xe
            </Badge>
            <ChevronRight className="h-4 w-4" />
            <Badge variant={showConfirm ? "default" : "outline"} className="px-4 py-1">
              2. Xác nhận
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Thông báo</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showConfirm ? (
          <div className="space-y-10">
            {/* Search Box Card */}
            <Card className="shadow-xl border-none ring-1">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> NGÀY NHẬN
                    </label>
                    <Input
                      type="date"
                      value={searchQuery.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSearchQuery({ ...searchQuery, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> NGÀY TRẢ
                    </label>
                    <Input
                      type="date"
                      value={searchQuery.endDate}
                      min={searchQuery.startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSearchQuery({ ...searchQuery, endDate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full h-10 font-bold shadow-md" onClick={handleSearch} disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Tìm kiếm ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading &&
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-52 w-full rounded-xl" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}

              {!loading &&
                cars.map((car) => (
                  <Card
                    key={car.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border">
                    <div className="relative h-56 overflow-hidden">
                      {car.mainImageUrl ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <Image
                            src={car.mainImageUrl}
                            alt={car.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car size={64} />
                        </div>
                      )}
                      <Badge className="absolute top-4 right-4">
                        <Star className="w-3 h-3 mr-1" />
                        {car.averageRating > 0 ? car.averageRating.toFixed(1) : "Mới"}
                      </Badge>
                    </div>
                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-xl font-bold line-clamp-1">{car.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{car.transmission || "Số tự động"}</span>
                        <span className="text-slate-300">•</span>
                        <span>{car.seatCount} chỗ</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider">Giá thuê 1 ngày</p>
                          <p className="text-2xl font-black text-blue-600">
                            {car.pricePerDay?.toLocaleString()}
                            <span className="text-sm font-normal"> đ</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="font-bold"
                          onClick={() => handleSelectCar(car)}
                          disabled={loading}>
                          Thuê ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          /* SUCCESS CONFIRMATION UI */
          <div className="max-w-2xl mx-auto py-10">
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-emerald-500 p-8 text-center text-white">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Gửi yêu cầu thành công!</CardTitle>
                <p className="opacity-90 mt-2">Mã đặt xe: #{bookingData.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <CardContent className="p-8 space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle className="font-bold">Chờ chủ xe xác nhận (Pending)</AlertTitle>
                  <AlertDescription>
                    Chủ xe sẽ nhận được thông báo yêu cầu của bạn. Sau khi họ chấp nhận (Approved), bạn có thể tiến hành
                    thanh toán từ Ví điện tử để hoàn tất.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Tên xe:</span>
                    <span className="font-bold">{selectedCar.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Thời gian thuê:</span>
                    <span className="font-bold">{calculateDays()} ngày</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tổng tiền thanh toán</span>
                    <span className="text-2xl font-black text-blue-600">
                      {bookingData.totalPrice?.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-8 dark:bg-slate-900 flex flex-col sm:flex-row gap-4">
                <Button
                  // variant="outline"
                  className="flex-1 h-12 font-bold dark:"
                  onClick={() => (window.location.href = "/customer/bookings")}>
                  Quản lý đơn đặt
                </Button>
                {/* <Button className="flex-1 h-12 font-bold" onClick={() => setShowConfirm(false)}>
                  Tiếp tục tìm xe
                </Button> */}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
