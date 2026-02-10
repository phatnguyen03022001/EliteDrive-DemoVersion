"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Fuel, Gauge, Calendar, User, Phone, MapPin } from "lucide-react";

interface Trip {
  id: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  startOdometer: number;
  endOdometer?: number;
  startFuelLevel: number;
  endFuelLevel?: number;
  pickupNotes?: string;
  dropoffNotes?: string;
  car: { name: string; licensePlate: string };
  booking: {
    startDate: string;
    endDate: string;
    pickupLocation: string;
    totalPrice: number;
    customer: { firstName: string; lastName: string; phone: string };
  };
}

export default function OwnerTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "checkin" | "checkout"; trip: Trip } | null>(null);
  const [form, setForm] = useState({ odometer: 0, fuel: 100, notes: "" });

  const fetchTrips = async () => {
    try {
      const res = await api.get("/api/owner/trips");
      // Truy cập đúng res.data.data dựa trên dữ liệu bạn cung cấp
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSubmit = async () => {
    if (!modal) return;
    try {
      const payload =
        modal.type === "checkin"
          ? { startOdometer: form.odometer, startFuelLevel: form.fuel, pickupNotes: form.notes }
          : { endOdometer: form.odometer, endFuelLevel: form.fuel, dropoffNotes: form.notes };

      await api.post(`/api/owner/trips/${modal.trip.id}/${modal.type}`, payload);
      setModal(null);
      fetchTrips();
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi hệ thống");
    }
  };

  const getStatusVariant = (status: Trip["status"]) => {
    const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
      UPCOMING: "secondary",
      ONGOING: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    };
    return variants[status] || "outline";
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Chuyến xe</h1>
        <p className="text-muted-foreground">Theo dõi quá trình giao nhận và trạng thái xe thực tế.</p>
      </div>

      <div className="grid gap-6">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm">
              <CardContent className="p-0">
                <div className="p-6">
                  {/* Header: Status & Price */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusVariant(trip.status)} className="px-3 py-1 text-xs">
                          {trip.status === "ONGOING" ? "ĐANG DI CHUYỂN" : trip.status}
                        </Badge>
                        <h3 className="text-xl font-bold">{trip.car?.name}</h3>
                      </div>
                      <p className="text-sm font-mono border rounded px-2 py-0.5 w-fit">{trip.car?.licensePlate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{trip.booking?.totalPrice.toLocaleString("vi-VN")} đ</p>
                      <p className="text-xs text-muted-foreground">Tổng giá trị</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Body: 3-Column Info */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="w-4 h-4" />
                        <span>
                          {trip.booking?.customer?.firstName} {trip.booking?.customer?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{trip.booking?.customer?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{trip.booking?.pickupLocation}</span>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="space-y-2 border-l pl-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(trip.booking?.startDate), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                      </div>
                      <div className="text-sm text-muted-foreground pl-6 italic">đến</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{format(new Date(trip.booking?.endDate), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                      </div>
                    </div>

                    {/* Technical Info (ODO & Fuel) */}
                    <div className="space-y-3 border-l pl-6 bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2 italic">
                          <Gauge className="w-4 h-4" /> ODO:
                        </span>
                        <span>
                          {trip.status === "UPCOMING" ? "---" : `${trip.startOdometer} km`}
                          {trip.status === "COMPLETED" && ` → ${trip.endOdometer} km`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2 italic">
                          <Fuel className="w-4 h-4" /> Xăng:
                        </span>
                        <span>
                          {trip.status === "UPCOMING" ? "---" : `${trip.startFuelLevel}%`}
                          {trip.status === "COMPLETED" && ` → ${trip.endFuelLevel}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-muted/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                  <div className="text-xs text-muted-foreground italic flex-1">
                    {trip.pickupNotes && <p>Giao: {trip.pickupNotes}</p>}
                    {trip.dropoffNotes && <p>Nhận: {trip.dropoffNotes}</p>}
                  </div>
                  <div className="flex gap-2">
                    {trip.status === "UPCOMING" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setModal({ type: "checkin", trip });
                          setForm({ odometer: 0, fuel: 100, notes: "" });
                        }}>
                        Giao xe (Check-in)
                      </Button>
                    )}
                    {trip.status === "ONGOING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModal({ type: "checkout", trip });
                          setForm({ odometer: trip.startOdometer || 0, fuel: 100, notes: "" });
                        }}>
                        Nhận xe (Check-out)
                      </Button>
                    )}
                    {trip.status === "COMPLETED" && <Badge variant="outline">Hoàn tất</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">Hiện chưa có chuyến xe nào được ghi nhận.</p>
          </div>
        )}
      </div>

      {/* Dialog Procedure */}
      <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tight">
              {modal?.type === "checkin" ? "Thủ tục Giao xe" : "Thủ tục Nhận xe"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-3 bg-muted rounded text-sm">
              Xe: <strong>{modal?.trip.car.name}</strong> - {modal?.trip.car.licensePlate}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="odometer">Số ODO (km)</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={form.odometer}
                  onChange={(e) => setForm({ ...form, odometer: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fuel">Mức xăng (%)</Label>
                <Input
                  id="fuel"
                  type="number"
                  max={100}
                  value={form.fuel}
                  onChange={(e) => setForm({ ...form, fuel: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú tình trạng</Label>
              <Textarea
                id="notes"
                placeholder="Ngoại thất, nội thất, vệ sinh..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setModal(null)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Xác nhận lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
