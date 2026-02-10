"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ForgotPasswordSchema, ForgotPasswordInput } from "../auth.schema";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, LockKeyhole, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [countdown, setCountdown] = useState(0);

  const { sendOtp, resetPassword, isLoading, isOtpLoading } = useAuth();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "", code: "", newPassword: "" },
  });

  const email = form.watch("email");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOtp = async (isResend = false) => {
    const isValid = await form.trigger("email");
    if (!isValid) return;

    sendOtp.forgot.mutate(email, {
      onSuccess: () => {
        toast.success(isResend ? "Đã gửi mã mới!" : "Mã xác thực đã được gửi");
        setCountdown(60);
        if (isResend) {
          form.setValue("code", "");
        } else {
          setStep(2);
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Lỗi gửi OTP");
      },
    });
  };

  const handleNextToStep3 = async () => {
    const isValid = await form.trigger("code");
    if (isValid) setStep(3);
  };

  const handleResetPassword = (data: ForgotPasswordInput) => {
    resetPassword(data, {
      onSuccess: () => {
        toast.success("Mật khẩu đã được cập nhật!");
        router.push("/login");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Lỗi xác thực";
        toast.error(msg);
        if (msg.toLowerCase().includes("otp")) setStep(2);
      },
    });
  };

  return (
    <Card className="w-full max-w-[450px] shadow-lg border-muted/50 mx-auto">
      <CardHeader className="space-y-1 text-center">
        {/* Stepper Icons */}
        <div className="flex justify-center mb-4 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn("h-2 w-12 rounded-full transition-all duration-300", step >= s ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>

        <CardTitle className="text-2xl font-bold">
          {step === 1 && "Quên mật khẩu?"}
          {step === 2 && "Xác nhận mã"}
          {step === 3 && "Đặt mật khẩu mới"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Nhập email của bạn để nhận mã khôi phục."}
          {step === 2 && `Chúng tôi đã gửi mã đến ${email}`}
          {step === 3 && "Vui lòng thiết lập mật khẩu mới cực kỳ bảo mật."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            {/* STEP 1: Email */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Email tài khoản
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="email@example.com" className="pl-9 h-11" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  className="w-full h-11"
                  disabled={isOtpLoading}
                  onClick={() => handleRequestOtp(false)}>
                  {isOtpLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Nhận mã xác thực
                </Button>
              </div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center block">
                        Mã OTP 6 chữ số
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          className="text-center font-black tracking-[0.5em] text-2xl h-14"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />

                <Button type="button" className="w-full h-11" onClick={handleNextToStep3}>
                  Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center py-2">
                  {countdown > 0 ? (
                    <p className="text-xs text-muted-foreground">Gửi lại mã mới sau {countdown}s</p>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-primary font-bold"
                      disabled={isOtpLoading}
                      onClick={() => handleRequestOtp(true)}>
                      Gửi lại mã OTP
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: New Password */}
            {step === 3 && (
              <form
                onSubmit={form.handleSubmit(handleResetPassword)}
                className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Mật khẩu mới
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-9 h-11" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Xác nhận đổi mật khẩu
                </Button>
              </form>
            )}
          </div>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center border-t py-4 bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (step === 1) router.push("/login");
            else setStep((s) => (s - 1) as 1 | 2 | 3);
          }}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {step === 1 ? "Quay lại đăng nhập" : "Quay lại bước trước"}
        </Button>
      </CardFooter>
    </Card>
  );
}
