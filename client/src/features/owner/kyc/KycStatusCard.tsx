"use client";

import { ChangeEvent, useState, useRef } from "react";
import Image from "next/image";
import { Camera, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const KycImageUpload = ({
  label,
  initialPreview,
  onChange,
}: {
  label: string;
  initialPreview?: string;
  onChange: (f: File | null) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cleanup URL cũ để tránh rò rỉ bộ nhớ
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Chặn sự kiện click lan ra ngoài làm trigger mở file dialog
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">{label}</span>

      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center overflow-hidden",
          preview
            ? "border-primary/20 bg-muted/30"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5",
        )}>
        <input type="file" ref={inputRef} onChange={handleChange} accept="image/*" className="hidden" />

        {preview ? (
          <>
            {/* Ảnh Preview */}
            <div className="relative w-full aspect-video">
              <Image src={preview} alt={label} fill className="object-cover" unoptimized />

              {/* Overlay khi Hover để thay đổi ảnh */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-8 h-8" />
              </div>

              {/* Nút Xóa ảnh */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          /* Trạng thái chưa có ảnh */
          <div className="flex flex-col items-center p-4 text-center">
            <div className="p-3 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs font-medium">Tải ảnh lên</p>
            <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG tối đa 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};
