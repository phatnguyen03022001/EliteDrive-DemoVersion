"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Send,
  Plus,
  Image as ImageIcon,
  Users,
  Gauge,
  Fuel,
  RefreshCw,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CreateCarSchema, CreateCarInput, UpdateCarInput, UpdateCarSchema } from "../owner.schema";
import { useCreateCar, useUpdateCar, useDeleteCar, useSubmitCarForReview, useMyCars } from "../owner.queries";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "../../../lib/utils";

// --- Components nhỏ hỗ trợ ---

export function CarImageUpload({ label, onChange, multiple = false, error }: any) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label className={error ? "text-red-500" : ""}>{label}</Label>
      <Input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => onChange(e.target.files)}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

export function CarManagementPage() {
  const { data: cars, isLoading, isRefetching, refetch } = useMyCars();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Danh sách xe</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            {isRefetching ? "Đang tải..." : "Làm mới"}
          </Button>
          <CreateCarDialog />
        </div>
      </div>

      <CarTable
        cars={cars}
        isLoading={isLoading}
        isRefetching={isRefetching} // Truyền thêm prop này nếu muốn hiện loading trong bảng
        refetch={refetch}
      />
    </div>
  );
}

export function CarStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    APPROVED: { label: "Đã duyệt", className: "bg-green-500" },
    PENDING: { label: "Chờ duyệt", className: "bg-yellow-500" },
    REJECTED: { label: "Từ chối", className: "bg-red-500" },
    DRAFT: { label: "Bản nháp", className: "bg-slate-500" },
  };

  const item = config[status] || config.DRAFT;
  return <Badge className={item.className}>{item.label}</Badge>;
}

// --- Form Đăng ký xe mới ---

export function CreateCarForm({ onSuccess }: { onSuccess: () => void }) {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const createMutation = useCreateCar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateCarInput>({
    resolver: zodResolver(CreateCarSchema) as any,
    defaultValues: { year: new Date().getFullYear(), seatCount: 4 },
  });

  const watchedPrice = watch("pricePerDay");
  const actualEarning = watchedPrice ? watchedPrice * 0.8 : 0;

  const onSubmit = (data: CreateCarInput) => {
    if (!mainImage) return toast.error("Vui lòng chọn ảnh chính");

    const formData = new FormData();

    // Logic an toàn để append dữ liệu
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // Gán tạm brand/model nếu form chưa có input để test
    if (!data.brand) formData.append("brand", "Unknown");
    if (!data.model) formData.append("model", "Default");

    formData.append("mainImage", mainImage);
    if (images) Array.from(images).forEach((file) => formData.append("images", file));

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Đăng ký thành công!");
        onSuccess();
      },
      onError: (err: any) => {
        // Log lỗi chi tiết từ Server
        console.error("Lỗi server:", err.response?.data);
        toast.error(err.response?.data?.message || "Lỗi không xác định");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Tên xe</Label>
          <Input {...register("name")} placeholder="VD: VinFast VF8" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Biển số</Label>
          <Input {...register("licensePlate")} placeholder="51H-123.45" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Hãng xe</Label>
          <Input {...register("brand")} placeholder="VinFast" />
        </div>
        <div>
          <Label>Model</Label>
          <Input {...register("model")} placeholder="VF8" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Năm SX</Label>
          <Input type="number" {...register("year", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <Label>Số ghế</Label>
          <Input type="number" {...register("seatCount", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1">
          <Label>Giá thuê/ngày</Label>
          <Input type="number" {...register("pricePerDay", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Truyền động</Label>
          <Controller
            name="transmission"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại số" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Số sàn</SelectItem>
                  <SelectItem value="AUTOMATIC">Số tự động</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1">
          <Label>Nhiên liệu</Label>
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại nhiên liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Xăng</SelectItem>
                  <SelectItem value="DIESEL">Dầu</SelectItem>
                  <SelectItem value="ELECTRIC">Điện</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <div className="rounded-lg bg-muted/50 p-2 mt-2">
            <p className="text-[10px] leading-relaxed text-muted-foreground uppercase tracking-tight font-medium">
              Phí nền tảng: <span className="text-foreground">20%</span>
            </p>
            {watchedPrice > 0 && (
              <p className="text-[11px] font-bold text-primary mt-0.5">
                Thực nhận: {actualEarning.toLocaleString("vi-VN")}đ/ngày
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <CarImageUpload label="Ảnh chính" onChange={(f: any) => setMainImage(f?.[0])} />
        <CarImageUpload label="Ảnh chi tiết" multiple onChange={(f: any) => setImages(f)} />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Đang lưu..." : "Đăng ký xe ngay"}
      </Button>
    </form>
  );
}

// --- Form Cập nhật xe ---

export function CreateCarDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Thêm xe</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký xe mới</DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>

          <CreateCarForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UpdateCarForm({ car, onSuccess }: { car: any; onSuccess: () => void }) {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const updateMutation = useUpdateCar();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UpdateCarInput>({
    resolver: zodResolver(UpdateCarSchema) as any,
    defaultValues: {
      name: car.name,
      brand: car.brand,
      model: car.model,
      licensePlate: car.licensePlate,
      year: car.year,
      seatCount: car.seatCount,
      pricePerDay: car.pricePerDay,
      transmission: car.transmission,
      fuelType: car.fuelType,
    },
  });

  const watchedPrice = watch("pricePerDay");
  const actualEarning = watchedPrice ? watchedPrice * 0.8 : 0;

  const onSubmit = (data: UpdateCarInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (mainImage) formData.append("mainImage", mainImage);
    if (images) Array.from(images).forEach((f) => formData.append("images", f));

    updateMutation.mutate(
      { carId: car.id, data: formData },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công");
          onSuccess();
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi cập nhật"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
      {/* Grid 1: Tên & Biển số */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tên xe</Label>
          <Input {...register("name")} />
        </div>
        <div className="space-y-1.5">
          <Label>Biển số</Label>
          <Input {...register("licensePlate")} />
        </div>
      </div>

      {/* Grid 2: Thông số kỹ thuật */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Giá thuê/ngày</Label>
          <Input type="number" {...register("pricePerDay", { valueAsNumber: true })} />
          <p className="text-[10px] text-primary font-bold">Nhận: {actualEarning.toLocaleString()}đ</p>
        </div>
        <div className="space-y-1.5">
          <Label>Truyền động</Label>
          <Controller
            name="transmission"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Số sàn</SelectItem>
                  <SelectItem value="AUTOMATIC">Số tự động</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nhiên liệu</Label>
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Xăng</SelectItem>
                  <SelectItem value="DIESEL">Dầu</SelectItem>
                  <SelectItem value="ELECTRIC">Điện</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <CarImageUpload label="Thay ảnh chính" onChange={(f: any) => setMainImage(f?.[0])} />
        <CarImageUpload label="Thêm ảnh chi tiết" multiple onChange={(f: any) => setImages(f)} />
      </div>

      <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Đang lưu..." : "Cập nhật thông tin xe"}
      </Button>
    </form>
  );
}
// --- Bảng danh sách xe ---

export function CarTable({
  cars,
  isLoading,
  isRefetching,
  refetch,
}: {
  cars: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
}) {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);

  const submitMutation = useSubmitCarForReview();
  const deleteMutation = useDeleteCar();
  const FUEL_LABELS: Record<string, string> = { GASOLINE: "Xăng", DIESEL: "Dầu", ELECTRIC: "Điện" };
  const TRANSMISSION_LABELS: Record<string, string> = { MANUAL: "Số sàn", AUTOMATIC: "Số tự động" };

  if (isLoading)
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải danh sách xe...</div>;

  return (
    <>
      <div className="rounded-md border ">
        {isRefetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Thông tin xe</TableHead>
              <TableHead>Biển số</TableHead>
              <TableHead>Giá/Ngày</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Bạn chưa có xe nào
                </TableCell>
              </TableRow>
            )}
            {cars?.map((car: any) => (
              <TableRow key={car.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-24 shrink-0 rounded-lg overflow-hidden border bg-muted">
                      {car.mainImageUrl ? (
                        <Image src={car.mainImageUrl} alt={car.name} fill className="object-cover" unoptimized />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto text-muted-foreground/50" size={20} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-sm leading-none">
                        {car.brand} {car.model} — {car.name}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {car.seatCount} ghế
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge size={12} /> {TRANSMISSION_LABELS[car.transmission]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel size={12} /> {FUEL_LABELS[car.fuelType]}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{car.licensePlate}</TableCell>
                <TableCell className="font-semibold text-blue-600">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(car.pricePerDay)}
                </TableCell>
                <TableCell>
                  <CarStatusBadge status={car.verificationStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCar(car);
                          setIsEditOpen(true);
                        }}>
                        <Edit size={14} className="mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                      {car.status === "DRAFT" && (
                        <DropdownMenuItem
                          className="text-blue-600"
                          onClick={() => submitMutation.mutate(car.id, { onSuccess: refetch })}>
                          <Send size={14} className="mr-2" /> Gửi duyệt
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => setCarToDelete(car.id)}>
                        <Trash size={14} className="mr-2" /> Xóa xe
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Sửa */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật xe</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <UpdateCarForm
              car={selectedCar}
              onSuccess={() => {
                setIsEditOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xóa */}
      <Dialog open={!!carToDelete} onOpenChange={() => setCarToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>Hành động này sẽ xóa vĩnh viễn xe khỏi hệ thống.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCarToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                carToDelete &&
                deleteMutation.mutate(carToDelete, {
                  onSuccess: () => {
                    setCarToDelete(null);
                    refetch();
                  },
                })
              }>
              Xóa ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
