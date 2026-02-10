"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CarFront,
  Fuel,
  Settings2,
  Users,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Clock,
  ShieldCheck,
  Car,
  Ban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { usePendingCars, useApproveCar, useRejectCar, useAllCars } from "@/features/admin/admin.queries";

export default function AdminCarManagementPage() {
  const { data: pendingData, isLoading: isLoadingPending, refetch: refetchPending } = usePendingCars();
  const { data: allCarsData, isLoading: isLoadingAll, refetch: refetchAll } = useAllCars();
  const approveCar = useApproveCar();
  const rejectCar = useRejectCar();

  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Logic lọc dữ liệu từ JSON
  const cars = allCarsData || [];
  const pendingCars = pendingData || [];
  const activeCars = useMemo(
    () => cars.filter((c: any) => c.status === "APPROVED" || c.verificationStatus === "APPROVED"),
    [cars],
  );
  const rejectedCars = useMemo(() => cars.filter((c: any) => c.verificationStatus === "REJECTED"), [cars]);

  const stats = [
    { label: "Tổng xe", value: cars.length, icon: Car, color: "text-blue-600" },
    { label: "Chờ phê duyệt", value: pendingCars.length, icon: Clock, color: "text-amber-600" },
    { label: "Đang hoạt động", value: activeCars.length, icon: ShieldCheck, color: "text-emerald-600" },
    { label: "Đã từ chối", value: rejectedCars.length, icon: Ban, color: "text-rose-600" },
  ];

  const handleApprove = (carId: string) => {
    if (confirm("Xác nhận xe đủ điều kiện vận hành?")) {
      approveCar.mutate(carId, {
        onSuccess: () => {
          refetchPending();
          refetchAll();
        },
      });
    }
  };

  const handleConfirmReject = () => {
    if (!selectedCar || !rejectReason) return;
    rejectCar.mutate(
      { carId: selectedCar.id, reason: rejectReason },
      {
        onSuccess: () => {
          setIsRejectOpen(false);
          refetchPending();
          refetchAll();
        },
      },
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý phương tiện</h2>
        <p className="text-muted-foreground">Phê duyệt và kiểm soát chất lượng xe EliteDrive.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                {s.label}
              </CardTitle>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <Tabs defaultValue="pending" className="w-full">
          <div className="px-6 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pending">Chờ duyệt ({pendingCars.length})</TabsTrigger>
              <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
              <TabsTrigger value="all">Tất cả xe</TabsTrigger>
              <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="p-6">
            <CarTableUI
              data={pendingCars}
              isLoading={isLoadingPending}
              onView={(car: any) => {
                setSelectedCar(car);
                setIsDetailOpen(true);
              }}
              onApprove={handleApprove}
              onReject={(car: any) => {
                setSelectedCar(car);
                setRejectReason("");
                setIsRejectOpen(true);
              }}
              isPendingView
            />
          </TabsContent>

          <TabsContent value="active" className="p-6">
            <CarTableUI
              data={activeCars}
              isLoading={isLoadingAll}
              onView={(car: any) => {
                setSelectedCar(car);
                setIsDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="all" className="p-6">
            <CarTableUI
              data={cars}
              isLoading={isLoadingAll}
              onView={(car: any) => {
                setSelectedCar(car);
                setIsDetailOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="rejected" className="p-6">
            <CarTableUI
              data={rejectedCars}
              isLoading={isLoadingAll}
              onView={(car: any) => {
                setSelectedCar(car);
                setIsDetailOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <DetailSheet open={isDetailOpen} onOpenChange={setIsDetailOpen} car={selectedCar} />

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối duyệt xe</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm font-medium">Lý do từ chối (Gửi đến chủ xe):</p>
            <Textarea
              placeholder="Nhập lý do..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason || rejectCar.isPending}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CarTableUI({ data, isLoading, onView, onApprove, onReject, isPendingView = false }: any) {
  if (isLoading) return <div className="py-20 text-center animate-pulse text-muted-foreground">Đang tải...</div>;
  if (!data?.length)
    return <div className="py-20 text-center border-2 border-dashed rounded-xl m-6 text-muted-foreground">Trống</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xe</TableHead>
            <TableHead>Chủ xe</TableHead>
            <TableHead>Giá thuê</TableHead>
            <TableHead>{isPendingView ? "Ngày đăng ký" : "Trạng thái"}</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((car: any) => (
            <TableRow key={car.id}>
              <TableCell className="flex items-center gap-3">
                <div className="relative h-10 w-16 rounded overflow-hidden border">
                  <Image src={car.mainImageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <div className="font-bold text-sm">{car.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-mono">{car.licensePlate}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs font-medium">
                  {car.owner?.firstName} {car.owner?.lastName}
                </div>
                <div className="text-[10px] text-muted-foreground">{car.owner?.email}</div>
              </TableCell>
              <TableCell className="text-sm font-bold">{Number(car.pricePerDay).toLocaleString("vi-VN")}₫</TableCell>
              <TableCell>
                {isPendingView ? (
                  <div className="text-xs text-muted-foreground">{format(new Date(car.createdAt), "dd/MM/yyyy")}</div>
                ) : (
                  <Badge
                    variant={
                      car.verificationStatus === "APPROVED"
                        ? "default"
                        : car.verificationStatus === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }>
                    {car.verificationStatus}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onView(car)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isPendingView && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600"
                        onClick={() => onApprove(car.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600"
                        onClick={() => onReject(car)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DetailSheet({ open, onOpenChange, car }: any) {
  if (!car) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl">
            {car.brand} {car.name}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] pr-4 pt-4">
          <div className="space-y-6 pb-10">
            {/* Gallery Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Album hình ảnh</h3>

              {/* Ảnh chính to nhất */}
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <Image src={car.mainImageUrl} alt="Main image" fill className="object-cover" unoptimized />
                <Badge className="absolute top-2 left-2 bg-black/60 border-none hover:bg-black/60">Ảnh chính</Badge>
              </div>

              {/* Grid các ảnh chi tiết (imageUrls) */}
              {car.imageUrls && car.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {car.imageUrls.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={url}
                        alt={`Gallery ${index}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thông báo lý do từ chối (nếu có) */}
            {car.verificationStatus === "REJECTED" && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm italic">
                <span className="font-bold text-destructive">Lý do từ chối:</span> {car.description}
              </div>
            )}

            {/* Thông số chi tiết */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Năm sản xuất" value={car.year} />
              <DetailItem label="Biển số" value={car.licensePlate} />
              <DetailItem label="Số chỗ" value={`${car.seatCount} ghế`} />
              <DetailItem label="Truyền động" value={car.transmission || "N/A"} />
            </div>

            <Separator />

            {/* Thông tin chủ xe */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase">Chủ sở hữu</h3>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-muted rounded-full">
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <p className="font-bold">
                    {car.owner?.firstName} {car.owner?.lastName}
                  </p>
                  <p className="text-muted-foreground">{car.owner?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
