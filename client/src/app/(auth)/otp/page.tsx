"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpForm } from "@/features/auth/components/OtpForm";

// 1. Import đúng Hook tổng mà bạn đã định nghĩa
import { useAuthQueries } from "@/features/auth/auth.queries";

export default function OtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 2. Gọi Hook tổng để lấy các mutation ra
  const authQueries = useAuthQueries();

  // Trích xuất các mutation verify từ object lồng nhau
  const verifyRegisterOtp = authQueries.otp.verify.register;
  const verifyLoginOtp = authQueries.otp.verify.login;
  const verifyForgotOtp = authQueries.otp.verify.forgot;

  const type = searchParams.get("type") as "register" | "login" | "forgot" | null;
  const email = searchParams.get("email");

  // Kiểm tra điều kiện
  if (!type || !email || !["register", "login", "forgot"].includes(type)) {
    router.replace("/auth/login");
    return null;
  }

  // 3. Chọn mutation tương ứng
  const verifyOtp = type === "register" ? verifyRegisterOtp : type === "login" ? verifyLoginOtp : verifyForgotOtp;

  const titles = {
    register: "Xác thực đăng ký",
    login: "Xác thực đăng nhập",
    forgot: "Xác thực đặt lại mật khẩu",
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{titles[type]}</CardTitle>
        <CardDescription className="text-center">
          Mã OTP đã được gửi đến <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <OtpForm email={email} onVerify={(payload) => verifyOtp.mutate(payload)} isLoading={verifyOtp.isPending} />
    </Card>
  );
}
