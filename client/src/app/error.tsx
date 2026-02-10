"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, ChevronDown, ChevronUp, Database } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const isPrismaError = error.message.toLowerCase().includes("prisma");

  useEffect(() => {
    if (isPrismaError) {
      // Logic for backend logging can go here
      console.error("Critical Prisma Sync Required:", error.digest);
    }
  }, [error, isPrismaError]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Your 404 Image - Kept as requested */}
        <div className="relative mb-4 transition-transform duration-500 hover:scale-105">
          <Image
            src="/images/404.png"
            alt="Error Illustration"
            width={380}
            height={380}
            priority
            className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Rất tiếc, có lỗi xảy ra!
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            {isPrismaError
              ? "Hệ thống cơ sở dữ liệu đang bận hoặc gặp trục trặc tạm thời. Vui lòng thử lại sau vài giây."
              : "Chúng tôi đã ghi nhận sự cố này và đang tiến hành khắc phục nhanh nhất có thể."}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => reset()}
            className="group w-full min-w-[160px] gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 sm:w-auto">
            <RefreshCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Thử lại ngay
          </Button>

          <Button variant="outline" size="lg" asChild className="w-full min-w-[160px] gap-2 sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>

        {/* Professional Error Detail Section */}
        <div className="mt-12 w-full max-w-md rounded-xl border border-border/60 bg-card/30 p-2 backdrop-blur-md">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 hover:text-foreground">
            <span className="flex items-center gap-2">
              {isPrismaError ? (
                <Database size={14} className="text-destructive" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              )}
              Chi tiết kỹ thuật
            </span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div className="mt-2 space-y-3 px-4 pb-4 text-left">
              <div className="rounded-md bg-muted/50 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-foreground/70">Mã định danh:</span> {error.digest || "ERR_UNKNOWN"}
                <br />
                <span className="text-foreground/70">Loại lỗi:</span>{" "}
                {isPrismaError ? "Database Exception" : "Application Error"}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/60">
                Hãy cung cấp mã này cho bộ phận hỗ trợ nếu sự cố tiếp tục diễn ra.
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 text-[11px] text-muted-foreground/50">
          &copy; 2026 Your System • Liên hệ hỗ trợ: admin@yourdomain.com
        </footer>
      </div>
    </main>
  );
}
