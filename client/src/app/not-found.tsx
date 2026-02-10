"use client";

import Link from "next/link";
import Image from "next/image"; // Quan trọng: Dùng để tối ưu ảnh
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveLeft, Home } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  const getHomeLink = () => {
    if (pathname.startsWith("/admin")) return "/admin";
    if (pathname.startsWith("/owner")) return "/owner";
    if (pathname.startsWith("/customer")) return "/customer/cars";
    return "/";
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10">
        <div className="h-[500px] w-[500px] rounded-full bg-primary blur-[150px]" />
      </div>

      <div className="max-w-2xl text-center">
        {/* Hình ảnh minh họa */}
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[400px] mb-8">
          <Image
            src="/images/404.png"
            alt="Error Illustration"
            width={400}
            height={400}
            priority
            className="drop-shadow-2xl"
          />
        </div>

        <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">Lỗi 404</p>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Trang này đã bay màu!
        </h1>

        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Đường dẫn <code className="font-mono text-primary font-medium">{pathname}</code> không tồn tại. Có lẽ bạn đã
          đi lạc quá xa rồi, hãy để chúng tôi đưa bạn về nơi an toàn.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="default"
            size="lg"
            asChild
            className="w-full sm:w-auto px-8 shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
            <Link href={getHomeLink()}>
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>

          <Button variant="outline" size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto">
            <MoveLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <div className="mt-16 border-t border-border pt-8 opacity-60">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Hệ thống hỗ trợ trực tuyến 24/7</p>
        </div>
      </div>
    </main>
  );
}
