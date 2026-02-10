"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Star,
  Car,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
  Loader2,
  ChevronLeft,
  UserIcon,
  Info,
} from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Types ──────────────────────────────────────────────────────
interface Review {
  id: string;
  bookingId: string;
  carId: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  car: { name: string };
}

interface PaginatedReviews {
  data: Review[];
  meta: { total: number; page: number; limit: number; lastPage: number };
}

// ── Helper Component ───────────────────────────────────────────
function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</p>
      <p className="text-sm font-semibold">{value || "---"}</p>
    </div>
  );
}

// ── Detail Sheet ───────────────────────────────────────────────
function DetailSheet({
  open,
  onOpenChange,
  carId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  carId: string | null;
}) {
  const { data: car, isLoading } = useQuery({
    queryKey: ["car-detail", carId],
    queryFn: async () => {
      if (!carId) return null;
      const res = await api.get(`/api/cars/${carId}`);
      return res.data?.data || res.data;
    },
    enabled: !!carId && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Chi tiết xe
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : !car ? (
          <div className="p-10 text-center text-muted-foreground">Không tìm thấy thông tin.</div>
        ) : (
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-6 space-y-8 pb-20">
              <div className="space-y-4">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border bg-muted">
                  <Image
                    src={car.mainImageUrl || "/placeholder.jpg"}
                    alt={car.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {car.imageUrls?.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {car.imageUrls.map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                        <Image src={url} alt="detail" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black leading-tight">
                  {car.brand} {car.name}
                </h2>
                <Badge variant="outline" className="font-mono">
                  {car.licensePlate}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Năm sản xuất", value: car.year },
                  { label: "Số chỗ ngồi", value: `${car.seatCount} ghế` },
                ].map((item, idx) => (
                  <div key={idx} className="bg-accent/30 p-4 rounded-2xl border">
                    <DetailItem {...item} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chủ sở hữu</h3>
                <div className="flex items-center gap-4 p-4 border rounded-2xl bg-card shadow-sm">
                  <div className="h-12 w-12 relative rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                    {car.owner?.avatar ? (
                      <Image
                        src={car.owner.avatar}
                        alt={`${car.owner.firstName} avatar`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold">
                      {car.owner?.firstName} {car.owner?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{car.owner?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    isPlaceholderData,
  } = useQuery<PaginatedReviews>({
    queryKey: ["customer", "reviews", "my", currentPage],
    queryFn: async () => {
      const res = await api.get("/api/customer/reviews/my", { params: { page: Number(currentPage), limit: 5 } });
      return res.data?.data ? res.data : res;
    },
    placeholderData: (previousData) => previousData,
  });

  const reviews = response?.data || [];
  const meta = response?.meta;

  if (isLoading && !isPlaceholderData) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Nhận xét của tôi</h1>
          <p className="text-muted-foreground">
            {meta?.total ? `Bạn đã đóng góp ${meta.total} nhận xét` : "Quản lý nhận xét của bạn"}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Bộ lọc
        </Button>
      </div>

      <Separator />

      <div className={`grid gap-6 transition-all duration-300 ${isPlaceholderData ? "opacity-50 grayscale" : ""}`}>
        {isError ? (
          <div className="p-10 text-center bg-destructive/10 rounded-3xl border border-destructive/20 text-destructive font-medium">
            Lỗi kết nối máy chủ.
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/30">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold">Chưa có đánh giá</h3>
            <p className="text-muted-foreground mt-2">Hãy thuê xe và chia sẻ cảm nhận đầu tiên nhé.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="group overflow-hidden hover:border-primary/50 transition-all shadow-sm">
              <CardHeader className="bg-muted/30 pb-4 border-b group-hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="bg-background p-3 rounded-xl border shadow-sm group-hover:scale-105 transition-transform">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{review.car.name}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2 italic">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(review.createdAt), "dd 'tháng' MM, yyyy", { locale: vi })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={review.rating >= 4 ? "default" : "secondary"}>
                    {review.rating >= 4 ? "Hài lòng" : "Góp ý"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted/30"}`}
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold">{review.title}</h4>
                  <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                    &quot;{review.content}&quot;
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    ID: #{review.bookingId.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-bold hover:bg-primary/10"
                    onClick={() => {
                      setSelectedCarId(review.carId);
                      setIsSheetOpen(true);
                    }}>
                    Xem chi tiết xe <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10">
          <Button
            variant="outline"
            className="rounded-xl px-6"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || isPlaceholderData}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Trước
          </Button>
          <span className="text-sm font-bold bg-muted px-4 py-2 rounded-lg border">
            {meta.page} / {meta.lastPage}
          </span>
          <Button
            variant="outline"
            className="rounded-xl px-6"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.lastPage))}
            disabled={currentPage === meta.lastPage || isPlaceholderData}>
            Sau <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <DetailSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} carId={selectedCarId} />
    </div>
  );
}
