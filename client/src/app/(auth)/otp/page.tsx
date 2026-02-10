"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpForm } from "@/features/auth/components/OtpForm";

import { useVerifyRegisterOtp, useVerifyLoginOtp, useVerifyForgotOtp } from "@/features/auth/queries/otp.queries";

export default function OtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Hooks ALWAYS first
  const verifyRegisterOtp = useVerifyRegisterOtp();
  const verifyLoginOtp = useVerifyLoginOtp();
  const verifyForgotOtp = useVerifyForgotOtp();

  const type = searchParams.get("type") as "register" | "login" | "forgot" | null;
  const email = searchParams.get("email");

  if (!type || !email || !["register", "login", "forgot"].includes(type)) {
    router.replace("/auth/login");
    return null;
  }

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
