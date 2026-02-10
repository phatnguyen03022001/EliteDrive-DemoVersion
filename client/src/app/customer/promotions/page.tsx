"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PromotionPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        {/* Tiêu đề trang */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Ưu đãi độc quyền</h1>
          <p className="text-muted-foreground">Khám phá những đặc quyền dành riêng cho thành viên Elite Drive</p>
        </div>

        {/* Khung ảnh ưu đãi trống (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group cursor-wait">
          {/* Lớp nền Shimmer Effect */}
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/50">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm shadow-sm">
                <Gift className="w-12 h-12 text-muted-foreground/40 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium text-muted-foreground">Chương trình ưu đãi đang được cập nhật</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">
                  Sắp ra mắt tại TP. Hồ Chí Minh
                </p>
              </div>
            </div>

            {/* Hiệu ứng tia sáng chạy ngang (Shimmer) */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </motion.div>

        {/* Nút hành động bổ sung */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="rounded-full px-8 bg-primary text-primary-foreground"
            onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
