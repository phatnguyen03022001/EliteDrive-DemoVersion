"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button"; // Đảm bảo bạn đã install shadcn button
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  initialPreview?: string;
  onChange: (file: File | null) => void;
};

export const KycImageUpload = ({ label, initialPreview, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSelect = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    onChange(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col space-y-3 w-full max-w-sm p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
      {/* Label style theo shadcn form */}
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>

      {/* Preview Area */}
      <div
        className={cn(
          "relative w-full aspect-[3/2] overflow-hidden rounded-lg border-2 border-dashed transition-colors flex items-center justify-center bg-muted/50",
          !preview ? "border-muted-foreground/20" : "border-primary/20",
        )}>
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            {/* Overlay nhẹ khi đã có ảnh */}
            <div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors" />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="p-3 rounded-full bg-background shadow-sm">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-medium">Chưa có ảnh tài liệu</span>
          </div>
        )}
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />

      {/* Shadcn Button */}
      <Button
        type="button"
        variant={preview ? "secondary" : "outline"}
        size="sm"
        className="w-full gap-2 text-xs h-9"
        onClick={() => inputRef.current?.click()}>
        {preview ? (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Thay đổi ảnh
          </>
        ) : (
          <>
            <ImagePlus className="h-3.5 w-3.5" />
            Chọn ảnh tải lên
          </>
        )}
      </Button>
    </div>
  );
};
