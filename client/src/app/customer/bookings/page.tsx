"use client";

import {
  Clock,
  MapPin,
  Star,
  AlertCircle,
  Loader2,
  CreditCard,
  QrCode,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

import { Textarea } from "@/components/ui/textarea";

const API_BASE = "http://localhost:8000/api/customer";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const callAPI = async (endpoint: string, options: any = {}) => {
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: options.method || "GET",
      data: options.body,
      params: options.params,
      headers: options.headers,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "API Error";
    throw new Error(message);
  }
};

export default function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, content: "" });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await callAPI("/bookings?page=1&limit=10");
      setBookings(res.data || []);
    } catch (error: any) {
      toast.error("Không thể tải lịch sử đặt xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary"; // vàng nhạt
      case "APPROVED":
        return "default"; // primary/blue
      case "CONFIRMED":
      case "COMPLETED":
        return "outline"; // xanh lá nhạt hoặc outline
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "APPROVED":
        return "Đã duyệt - Chờ thanh toán";
      case "CONFIRMED":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Đã hủy";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return b.status === "PENDING";
    if (activeTab === "approved") return b.status === "APPROVED";
    if (activeTab === "completed") return ["COMPLETED", "CONFIRMED"].includes(b.status);
    return true;
  });

  const handleCreatePayment = async (booking: any) => {
    if (booking.status !== "APPROVED") {
      toast.error("Chỉ có thể thanh toán khi Owner đã duyệt đơn");
      return;
    }

    setLoading(true);
    try {
      const res = await callAPI("/payments/create", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: "VNPAY",
        }),
      });

      if (res.success) {
        setSelectedBooking(booking);
        setPaymentData(res.data);
        setShowPayment(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleMockScan = async () => {
    setLoading(true);
    try {
      await fetch(paymentData.mockQrUrl);
      toast.success("Thanh toán thành công!");
      setShowPayment(false);
      setPaymentData(null);
      setSelectedBooking(null);
      fetchBookings();
    } catch {
      toast.error("Lỗi xác nhận thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc muốn hủy đơn này?")) return;

    setLoading(true);
    try {
      await callAPI(`/bookings/${bookingId}/cancel`, { method: "PUT" });
      toast.success("Đã hủy đơn đặt xe");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Không thể hủy đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (booking: any) => {
    setSelectedBooking(booking);
    setReviewData({ rating: 0, content: "" });
    setShowReviewDialog(true);
  };

  const onSubmitReview = async () => {
    if (reviewData.rating === 0) return toast.error("Vui lòng chọn số sao");
    if (reviewData.content.length < 10) return toast.error("Nội dung đánh giá quá ngắn");

    setSubmittingReview(true);
    try {
      await callAPI("/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          carId: selectedBooking.carId,
          rating: reviewData.rating,
          content: reviewData.content,
          title: `Đánh giá chuyến đi ${selectedBooking.car?.name}`,
        }),
      });

      toast.success("Cảm ơn bạn đã đánh giá!");
      setShowReviewDialog(false);
      fetchBookings(); // Load lại để cập nhật trạng thái nếu cần
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử đặt xe</h1>
          <p className="text-muted-foreground mt-1">Theo dõi hành trình và quản lý các giao dịch của bạn</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
            {/* <TabsTrigger value="approved">Đã duyệt</TabsTrigger> */}
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Skeleton className="h-24 w-24 rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <p className="text-muted-foreground">Không có đơn đặt xe nào</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6 flex gap-5">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
                        {booking.car?.mainImageUrl ? (
                          <Image
                            src={booking.car.mainImageUrl}
                            alt={booking.car.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <QrCode size={40} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={getBadgeVariant(booking.status)}>{getStatusLabel(booking.status)}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">#{booking.id.slice(-8)}</span>
                        </div>

                        <h3 className="font-semibold text-lg leading-tight">{booking.car?.name}</h3>

                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.startDate).toLocaleDateString("vi-VN")} —{" "}
                            {new Date(booking.endDate).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {booking.pickupLocation || "Elite Company"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 bg-muted/40 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l">
                      <div className="text-right space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Tổng thanh toán
                        </p>
                        <p className="text-2xl font-bold">{booking.totalPrice?.toLocaleString("vi-VN")} ₫</p>
                      </div>

                      <div className="mt-6 space-y-3">
                        {booking.status === "APPROVED" && (
                          <Button onClick={() => handleCreatePayment(booking)} disabled={loading} className="w-full">
                            {loading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            Thanh toán ngay
                          </Button>
                        )}

                        {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                          <Button
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={loading}
                            className="w-full border-destructive text-destructive hover:bg-destructive/10">
                            <XCircle className="mr-2 h-4 w-4" />
                            Hủy đơn
                          </Button>
                        )}

                        {booking.status === "COMPLETED" && (
                          <Button
                            variant="secondary"
                            className="w-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                            onClick={() => handleOpenReview(booking)}>
                            <Star className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                            Đánh giá ngay
                          </Button>
                        )}
                        {booking.status === "PENDING" && (
                          <p className="text-xs text-center text-muted-foreground">Đang chờ chủ xe xác nhận</p>
                        )}

                        {booking.status === "CONFIRMED" && (
                          <p className="text-xs text-center text-green-600 font-medium">Đã thanh toán thành công</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.trip?.status === "ONGOING" && (
                    <div className="bg-primary text-primary-foreground px-6 py-3 text-sm flex items-center gap-3">
                      <AlertCircle className="h-5 w-5" />
                      <span>Bạn đang trong hành trình. Chúc bạn lái xe an toàn!</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <QrCode className="h-6 w-6" />
              Quét mã thanh toán
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="bg-muted/50 border-2 border-dashed rounded-xl p-6 text-center">
              <div className="mx-auto w-48 h-48 bg-background rounded-lg flex flex-col items-center justify-center gap-4 shadow-sm">
                <QrCode className="h-28 w-28 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Mã GD: #{paymentData?.id?.slice(0, 12)}</p>
              </div>
            </div>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sau khi thanh toán</AlertTitle>
              <AlertDescription className="text-sm">
                • Booking chuyển sang CONFIRMED
                <br />
                • Tự động tạo Trip (UPCOMING)
                <br />• Xe sẵn sàng cho chuyến đi
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button onClick={handleMockScan} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Giả lập đã thanh toán
            </Button>
            <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full sm:w-auto">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá chuyến đi</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn về xe {selectedBooking?.car?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="transition-transform hover:scale-110">
                    <Star
                      className={`h-10 w-10 ${
                        (hoveredRating || reviewData.rating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {reviewData.rating > 0 ? `${reviewData.rating}/5 sao` : "Chọn mức độ hài lòng"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bình luận chi tiết</label>
              <Textarea
                placeholder="Xe chạy êm, sạch sẽ, chủ xe nhiệt tình..."
                value={reviewData.content}
                onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                className="min-h-[100px]"
              />
              <p className="text-[10px] text-muted-foreground italic">Tối thiểu 10 ký tự</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReviewDialog(false)}>
              Hủy
            </Button>
            <Button onClick={onSubmitReview} disabled={submittingReview} className="bg-primary">
              {submittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
