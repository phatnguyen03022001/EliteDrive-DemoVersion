"use client";

import { useParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm"; // Tạo component này nếu chưa có

export default function ResetPasswordPage() {
  const { token } = useParams();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
        <p className="text-muted-foreground mt-2">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>
      <ResetPasswordForm token={token as string} />
    </div>
  );
}
