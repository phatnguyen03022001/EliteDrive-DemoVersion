"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PasswordLoginForm } from "./login/PasswordLoginForm";
import { OtpLoginForm } from "./login/OtpLoginForm";
import { LockKeyhole, Smartphone } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<"password" | "otp">("password");

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-[420px] shadow-lg border-muted/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Chào mừng quay trở lại!</CardTitle>
          <CardDescription className="text-xs">
            Chọn phương thức đăng nhập để tiếp tục quản lý chuyến xe của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Tabs value={method} onValueChange={(v) => setMethod(v as "password" | "otp")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted/50">
              <TabsTrigger value="password" className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4" />
                <span>Mật khẩu</span>
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Mã OTP</span>
              </TabsTrigger>
            </TabsList>

            {/* Render Form tương ứng */}
            <div className="min-h-[220px] transition-all duration-300">
              {method === "password" ? <PasswordLoginForm /> : <OtpLoginForm />}
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t pt-6">
          <div className="flex flex-col w-full gap-3">
            {/* Nút Đăng ký làm nổi bật hẳn lên */}
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              onClick={() => router.push("/register")}>
              Đăng ký tài khoản
            </Button>

            {/* Quên mật khẩu làm mờ đi */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground font-normal hover:bg-transparent hover:text-foreground"
              onClick={() => router.push("/forgot-password")}>
              Tôi quên mật khẩu truy cập
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
