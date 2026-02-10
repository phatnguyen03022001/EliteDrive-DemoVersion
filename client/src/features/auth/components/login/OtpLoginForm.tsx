"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpLoginSchema, OtpLoginInput } from "../../auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function OtpLoginForm() {
  // --- Hook phải đặt ở ĐÂY (bên trong component) ---
  const { verifyLoginOtp, sendOtp, isOtpLoading, isLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<OtpLoginInput>({
    resolver: zodResolver(OtpLoginSchema),
    defaultValues: { email: "", code: "" },
  });

  const email = form.watch("email");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    const isValid = await form.trigger("email");
    if (!isValid) return;

    sendOtp.login.mutate(email, {
      onSuccess: () => {
        setStep(2);
        setCountdown(60);
      },
    });
  };

  const onSubmit = (data: OtpLoginInput) => {
    // Sử dụng hàm verifyLoginOtp từ useAuth để tự động điều hướng Role sau khi login
    verifyLoginOtp(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Email đăng nhập</FormLabel>
              <Input placeholder="email@example.com" {...field} disabled={step === 2 || isOtpLoading} />
              <FormMessage />
            </FormItem>
          )}
        />

        {step === 2 && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-semibold">Mã xác thực</FormLabel>
                </div>
                <Input
                  placeholder="0 0 0 0 0 0"
                  className="text-center font-bold tracking-[0.5em] text-lg"
                  maxLength={6}
                  {...field}
                />
                <FormMessage />
                <div className="flex justify-end mt-1">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary"
                    disabled={countdown > 0 || isOtpLoading}
                    onClick={handleSendOtp}>
                    {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã OTP"}
                  </Button>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="pt-2">
          {step === 1 ? (
            <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isOtpLoading}>
              {isOtpLoading ? "Đang gửi..." : "Nhận mã OTP qua Email"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xác thực..." : "Đăng nhập"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep(1)}>
                Thay đổi Email
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
