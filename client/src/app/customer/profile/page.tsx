"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateCustomerProfileSchema, UpdateCustomerProfileInput } from "@/features/customer/customer.schema";
import { useProfile, useUpdateProfile } from "@/features/customer/customer.queries";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User,
  MapPin,
  Phone,
  Undo2,
  Mail,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Hash,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";

// Component con hiển thị thông tin dạng dòng
const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
      <Icon className="w-3 h-3" /> {label}
    </span>
    <p className="text-sm font-medium">{value || "---"}</p>
  </div>
);

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateCustomerProfileInput>({
    resolver: zodResolver(UpdateCustomerProfileSchema),
    values: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      avatar: profile?.avatar || "",
      address: profile?.profile?.address || "",
      city: profile?.profile?.city || "",
      country: profile?.profile?.country || "Vietnam",
      postalCode: profile?.profile?.postalCode || "",
      dateOfBirth: profile?.profile?.dateOfBirth
        ? new Date(profile.profile.dateOfBirth).toISOString().split("T")[0]
        : "",
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = (data: UpdateCustomerProfileInput) => {
    // 1. Tạo đối tượng FormData
    const formData = new FormData();

    // 2. Duyệt qua các key trong data và append vào FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "avatar") {
        if (value instanceof File) {
          // Nếu là file mới chọn, append file vào
          formData.append("avatar", value);
        } else if (typeof value === "string" && value.startsWith("http")) {
          // Nếu là URL cũ (không thay đổi ảnh), gửi chuỗi URL
          formData.append("avatar", value);
        }
      } else {
        // Các trường khác (firstName, phone, address...)
        formData.append(key, value.toString());
      }
    });

    // 3. Gửi formData (ép kiểu any nếu hook mutate yêu cầu Object)
    updateProfile.mutate(formData as any, {
      onSuccess: () => {
        toast.success("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        setPreviewUrl(null);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "Không thể cập nhật hồ sơ";
        toast.error(msg);
      },
    });
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    setPreviewUrl(null);
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-black/5 border-dashed border-2 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse text-sm">Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  const isKycApproved = profile?.kycStatus === "APPROVED";

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Hồ sơ của tôi
            </CardTitle>
            <CardDescription>Quản lý thông tin cá nhân và địa chỉ liên lạc.</CardDescription>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="h-9 px-4 font-semibold">
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm ${
                isKycApproved
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-600"
              }`}>
              {isKycApproved ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {profile?.kycStatus || "Chưa xác minh"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* AVATAR SECTION - Luôn hiển thị ở trên cùng */}
            <div className="flex flex-col items-center gap-4 pb-8 border-b border-dashed">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted">
                  {previewUrl || profile?.avatar ? (
                    <img src={previewUrl || profile?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Thay đổi</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("avatar", file, { shouldDirty: true });
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {!isEditing && <h2 className="text-xl font-bold">{`${profile?.lastName} ${profile?.firstName}`}</h2>}
            </div>

            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
                <p className="text-sm text-muted-foreground">Thông tin cơ bản định danh tài khoản.</p>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing ? (
                  <>
                    <FormItem className="md:col-span-2 opacity-70">
                      <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email (Không thể thay đổi)
                      </FormLabel>
                      <Input value={profile?.email} disabled className="bg-muted" />
                    </FormItem>
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase">Họ & Đệm</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase">Tên</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Ngày sinh
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Điện thoại
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <InfoRow icon={Mail} label="Email đăng nhập" value={profile?.email} />
                    </div>
                    <InfoRow icon={User} label="Họ và tên" value={`${profile?.lastName} ${profile?.firstName}`} />
                    <InfoRow
                      icon={Calendar}
                      label="Ngày sinh"
                      value={
                        profile?.profile?.dateOfBirth
                          ? new Date(profile.profile.dateOfBirth).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"
                      }
                    />
                    <InfoRow icon={Phone} label="Số điện thoại" value={profile?.phone} />
                  </>
                )}
              </div>
            </section>

            {/* PHẦN 2: ĐỊA CHỈ */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-dashed">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold">Địa chỉ & Liên lạc</h3>
                <p className="text-sm text-muted-foreground">Thông tin nơi cư trú hiện tại.</p>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing ? (
                  <>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Địa chỉ chi tiết
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Thành phố</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Mã bưu chính
                          </FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <InfoRow icon={MapPin} label="Địa chỉ" value={profile?.profile?.address} />
                    </div>
                    <InfoRow icon={MapPin} label="Thành phố" value={profile?.profile?.city} />
                    <InfoRow icon={Hash} label="Mã bưu chính" value={profile?.profile?.postalCode} />
                    <InfoRow icon={MapPin} label="Quốc gia" value={profile?.profile?.country} />
                  </>
                )}
              </div>
            </section>

            {/* ACTION BUTTONS */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-6 border-t animate-in fade-in slide-in-from-bottom-2">
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={updateProfile.isPending}>
                  <Undo2 className="w-4 h-4 mr-2" /> Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfile.isPending}
                  className="min-w-[140px] font-bold shadow-lg">
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
