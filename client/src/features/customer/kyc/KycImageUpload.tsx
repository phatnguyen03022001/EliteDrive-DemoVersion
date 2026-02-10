"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  initialPreview?: string;
  onChange: (file: File | null) => void;
  className?: string;
};

export const KycImageUpload = ({ label, initialPreview, onChange, className }: Props) => {
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

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      <div
        className={cn(
          "relative group flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-all overflow-hidden",
          preview ? "border-muted" : "border-muted-foreground/25 hover:border-primary/50",
        )}>
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                Thay đổi
              </Button>
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 w-full h-full text-muted-foreground hover:text-foreground transition-colors">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Nhấn để tải lên tài liệu KYC</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />
    </div>
  );
};
