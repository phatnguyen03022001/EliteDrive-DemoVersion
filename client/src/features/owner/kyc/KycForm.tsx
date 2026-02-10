"use client";

import { useState } from "react";
import { OwnerService } from "@/features/owner/owner.service";
import { KycImageUpload } from "./KycImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Loader2, SendHorizontal, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
    // 1. Validation cơ bản
    if (!files.documentFront || !files.documentBack || !files.faceImage) {
      toast.error("Thiếu hình ảnh", { description: "Vui lòng tải lên đầy đủ 3 loại ảnh." });
      return;
    }
    if (!documentNumber.trim()) {
      toast.error("Thiếu thông tin", { description: "Vui lòng nhập số giấy tờ định danh." });
      return;
    }

    setLoading(true);
    try {
      await OwnerService.submitKyc({ documentType, documentNumber }, files);

      // 2. Hiệu ứng thành công
      setIsSuccess(true);

      toast.success("Gửi hồ sơ thành công!");
    } catch (e) {
      console.error(e);
      toast.error("Gửi thất bại", { description: "Vui lòng kiểm tra lại kết nối mạng." });
    } finally {
      setLoading(false);
    }
  };

  // Nếu thành công, hiển thị màn hình chúc mừng nhẹ nhàng
  if (isSuccess) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold">Hồ sơ đã được gửi!</h3>
        <p className="text-muted-foreground">Chúng tôi sẽ xét duyệt hồ sơ của bạn trong vòng 24h làm việc.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Xem lại trạng thái
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Loại giấy tờ</Label>
          <Select value={documentType} onValueChange={setDocumentType} disabled={loading}>
            <SelectTrigger>
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
            placeholder="Nhập số định danh"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Hình ảnh minh chứng</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 relative overflow-hidden group">
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải lên dữ liệu...
          </div>
        ) : (
          <div className="flex items-center">
            <SendHorizontal className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            Gửi hồ sơ xác thực
          </div>
        )}
      </Button>
    </div>
  );
};
