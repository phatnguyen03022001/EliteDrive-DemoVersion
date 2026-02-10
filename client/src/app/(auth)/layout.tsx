// (auth)/layout.tsx
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

export const metadata = {
  title: "Đăng nhập / Đăng ký - Elite Drive",
  description: "Quản lý xe thuê và đặt xe nhanh chóng",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Background Image Container */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/auth-bg.png"
          alt="Elite Drive Authentication Background"
          fill
          className="object-cover"
          priority
        />
        {/* Lớp phủ (Overlay) đa tầng:
            1. bg-black/40: Làm tối ảnh gốc để lấy độ tương phản
            2. backdrop-blur-md: Tạo hiệu ứng kính mờ đặc trưng của Shadcn
            3. bg-background/60: Hòa trộn màu nền hệ thống (đen hoặc trắng)
        */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      </div>

      {/* Header Container - Tăng độ tương phản cho text */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center justify-center p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all group">
        <Home className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        <span className="sr-only">Về trang chủ</span>
      </Link>

      {/* Khối nội dung chính */}
      <div className="relative z-10 w-full max-w-[400px] text-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
          Elite Drive
        </h1>

        <p className="text-muted-foreground mt-3 text-[10px] uppercase tracking-[0.3em] font-bold">
          Experience Premium Mobility
        </p>
      </div>

      {/* Main Content - Nơi chứa Shadcn Card */}
      <main className="relative z-10 w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 text-xs text-muted-foreground/60 font-medium tracking-tight">
        © 2026 <span className="text-muted-foreground/85">Elite Drive</span>. Built with Next.js & Prisma.
      </footer>
    </div>
  );
}
