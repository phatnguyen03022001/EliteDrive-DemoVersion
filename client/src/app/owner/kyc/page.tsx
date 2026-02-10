"use client";

import Image from "next/image";
import { useKycStatus } from "@/features/owner/owner.queries";
import { KycForm } from "@/features/owner/kyc/KycForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock, Eye, FileText, User, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Sub-components ---

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { label: string; icon: any; class: string }> = {
    APPROVED: {
      label: "Đã phê duyệt",
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
      class: "text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    },
    PENDING: {
      label: "Đang chờ duyệt",
      icon: <Clock className="w-3.5 h-3.5 mr-1.5" />,
      class: "text-amber-600 border-amber-200 bg-amber-50/50 dark:bg-amber-500/10 dark:border-amber-500/20",
    },
    REJECTED: {
      label: "Bị từ chối",
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
      class: "text-destructive border-destructive/20 bg-destructive/5",
    },
    NONE: {
      label: "Chưa xác thực",
      icon: null,
      class: "text-muted-foreground border-border bg-secondary/50",
    },
  };

  const config = variants[status] || variants.NONE;

  return (
    <Badge variant="outline" className={cn("px-4 py-1 font-medium rounded-full", config.class)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

function KycImagePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="group space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
        <FileText className="w-3 h-3" />
        {label}
      </div>
      <div
        className="relative aspect-[16/10] rounded-xl overflow-hidden border bg-muted/30 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 shadow-sm"
        onClick={() => window.open(src, "_blank")}>
        <Image
          src={src}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
            <Eye className="w-4 h-4" />
            Phóng to
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function KycPage() {
  const { data: kyc, isLoading } = useKycStatus();

  if (isLoading) return <KycLoadingSkeleton />;

  const status = kyc?.status ?? "NONE";

  if (status === "PENDING" || status === "APPROVED") {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-muted/10">
            <div className="flex items-center gap-4">
              <div className="p-2.5 border rounded-xl bg-background shadow-sm">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="my-4">
                <CardTitle className="text-xl font-bold">Hồ sơ định danh</CardTitle>
                <CardDescription className="font-mono text-[10px] uppercase opacity-70">
                  {/* ID: {kyc.id?.slice(-12)} */}
                </CardDescription>
              </div>
            </div>
            <StatusBadge status={status} />
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Loại giấy tờ" value={kyc.documentType} />
                <InfoItem label="Số giấy tờ" value={kyc.documentNumber} />
                <InfoItem label="Ngày gửi yêu cầu" value={new Date(kyc.submittedAt).toLocaleDateString("vi-VN")} />
                <InfoItem label="Phương thức" value="E-KYC System" />
              </div>

              <div className="p-5 rounded-xl border bg-accent/30 flex flex-col justify-center gap-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Dữ liệu an toàn
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thông tin của bạn đã được mã hóa. Chỉ bộ phận thẩm định có quyền truy cập.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/80">Hình ảnh đối chiếu</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <KycImagePreview src={kyc.documentFrontUrl} label="Mặt trước" />
                <KycImagePreview src={kyc.documentBackUrl} label="Mặt sau" />
                <KycImagePreview src={kyc.faceImageUrl} label="Ảnh chân dung" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <Alert variant="destructive" className="p-6 border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold ml-2">Hồ sơ bị từ chối</AlertTitle>
          <AlertDescription className="ml-2 mt-2">
            <div className="p-4 bg-background/50 rounded-lg border border-destructive/20 mt-2">
              <span className="text-[10px] font-bold uppercase opacity-60 block mb-1">Lý do:</span>
              <p className="font-medium text-foreground">
                &ldquo;{kyc.rejectionReason || "Hình ảnh không đạt yêu cầu."}&rdquo;
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Card className="border-t-4 border-t-primary overflow-hidden">
          <CardHeader>
            <CardTitle>Cập nhật lại thông tin</CardTitle>
            <CardDescription>Vui lòng cung cấp lại hình ảnh rõ nét hơn.</CardDescription>
          </CardHeader>
          <CardContent>
            <KycForm defaultValues={kyc} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Xác thực danh tính</h1>
        <p className="text-muted-foreground">Vui lòng hoàn tất KYC để bắt đầu kinh doanh trên nền tảng.</p>
      </div>
      <Card>
        <CardContent className="p-8">
          <KycForm />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function KycLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
