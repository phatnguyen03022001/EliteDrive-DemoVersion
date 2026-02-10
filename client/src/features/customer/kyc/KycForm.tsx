"use client";

import { useState } from "react";
import { CustomerService } from "@/features/customer/customer.service";
import { KycImageUpload } from "./KycImageUpload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Đảm bảo bạn đã cài sonner
import { cn } from "@/lib/utils";

export const KycForm = ({ defaultValues }: { defaultValues?: any }) => {
  const [documentType, setDocumentType] = useState(defaultValues?.documentType ?? "CCCD");
  const [documentNumber, setDocumentNumber] = useState(defaultValues?.documentNumber ?? "");
  const [files, setFiles] = useState<{
    documentFront?: File;
    documentBack?: File;
    faceImage?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    // Validation cơ bản trước khi submit
    if (!documentNumber) {
      toast.error("Vui lòng nhập số giấy tờ");
      return;
    }

    setLoading(true);
    // Tạo một promise để toast hiển thị trạng thái loading
    const promise = CustomerService.submitKyc({ documentType, documentNumber }, files);

    toast.promise(promise, {
      loading: "Đang mã hóa và tải hồ sơ lên...",
      success: () => {
        setIsSuccess(true);
        setLoading(false);
        return "Hồ sơ KYC đã được gửi thành công!";
      },
      error: () => {
        setLoading(false);
        return "Gửi hồ sơ thất bại, vui lòng thử lại.";
      },
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
  };

  // Nếu gửi thành công, hiển thị màn hình chúc mừng nhẹ
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Gửi hồ sơ thành công</h3>
        <p className="text-muted-foreground text-center max-w-[300px]">
          Chúng tôi sẽ kiểm tra thông tin của bạn trong vòng 24h làm việc.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Xem trạng thái hồ sơ
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative space-y-8 transition-all duration-500",
        loading ? "opacity-70 pointer-events-none" : "opacity-100",
      )}>
      {/* Hiệu ứng tia sáng chạy ngang khi loading */}
      {loading && (
        <div className="absolute inset-x-0 -top-2 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full bg-primary animate-progress-loading" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Loại giấy tờ</Label>
          <Select value={documentType} onValueChange={setDocumentType} disabled={loading}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CCCD">CCCD / CMND</SelectItem>
              <SelectItem value="PASSPORT">Hộ chiếu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Số giấy tờ</Label>
          <Input
            className="h-11 shadow-sm focus-visible:ring-primary"
            placeholder="Nhập số định danh"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Hình ảnh minh chứng</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KycImageUpload
            label="Mặt trước"
            initialPreview={defaultValues?.documentFrontUrl}
            onChange={(f) => setFiles((p) => ({ ...p, documentFront: f ?? undefined }))}
          />
          <KycImageUpload
            label="Mặt sau"
            initialPreview={defaultValues?.documentBackUrl}
            onChange={(f) => setFiles((p) => ({ ...p, documentBack: f ?? undefined }))}
          />
          <KycImageUpload
            label="Chân dung"
            initialPreview={defaultValues?.faceImageUrl}
            onChange={(f) => setFiles((p) => ({ ...p, faceImage: f ?? undefined }))}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className={cn(
          "w-full h-12 relative overflow-hidden group transition-all duration-300",
          loading ? "bg-muted text-muted-foreground" : "hover:shadow-lg",
        )}>
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang xử lý hồ sơ...
          </div>
        ) : (
          <div className="flex items-center">
            <SendHorizontal className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            Xác nhận gửi hồ sơ
          </div>
        )}
      </Button>
    </div>
  );
};
