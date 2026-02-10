"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import từ các file logic của bạn
import { RegisterPasswordSchema, OtpSchema, RegisterPasswordBody } from "../auth.schema";
import { useAuth } from "../../../hooks/useAuth";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  // Lấy các actions và loading state từ useAuth
  const { register, sendOtp, verifyOtp, registerLoading, verifyRegisterOtpLoading, sendOtpRegisterLoading } = useAuth();

  const isSubmitting = step === 1 ? registerLoading : verifyRegisterOtpLoading;

  const form = useForm<RegisterPasswordBody & { code: string; role: string }>({
    resolver: zodResolver(step === 1 ? RegisterPasswordSchema : OtpSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      code: "",
      role: "CUSTOMER", // Giá trị mặc định
    },
  });

  const onSubmit = (data: any) => {
    if (step === 1) {
      // BƯỚC 1: Đăng ký với Role đã chọn
      register(data, {
        onSuccess: () => {
          toast.success("Đăng ký thành công! Vui lòng kiểm tra mã OTP trong email.");
          setStep(2);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Đăng ký thất bại";
          toast.error(typeof msg === "string" ? msg : "Thông tin không hợp lệ");
        },
      });
    } else {
      // BƯỚC 2: Xác thực OTP
      verifyOtp.register.mutate(
        { email: data.email, code: data.code },
        {
          onSuccess: () => {
            toast.success("Xác thực tài khoản thành công!");
            // Sau khi xác thực, chuyển hướng về login
            router.push("/login");
          },
          onError: (err: any) => {
            const msg = err.response?.data?.message || "Mã OTP không đúng";
            toast.error(typeof msg === "string" ? msg : "Xác thực thất bại");
          },
        },
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-background/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle>{step === 1 ? "Đăng ký tài khoản" : "Xác thực Email"}</CardTitle>
        <CardDescription>
          {step === 1 ? "Điền thông tin để bắt đầu" : `Nhập mã OTP gửi đến ${form.getValues("email")}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                {/* TRƯỜNG CHỌN ROLE */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center space-y-2 pb-2">
                      <FormLabel>Loại tài khoản</FormLabel>
                      <FormControl>
                        <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 h-12">
                            <TabsTrigger value="CUSTOMER" className="gap-2">
                              <User className="h-4 w-4" /> Khách thuê
                            </TabsTrigger>
                            <TabsTrigger value="OWNER" className="gap-2">
                              <ShieldCheck className="h-4 w-4" /> Chủ xe
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <Input placeholder="Nguyễn" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <Input placeholder="Văn A" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="0901234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="000000"
                          className="text-center text-2xl tracking-[0.5em] font-bold h-14"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    disabled={sendOtpRegisterLoading}
                    onClick={() => sendOtp.register.mutate(form.getValues("email"))}>
                    {sendOtpRegisterLoading ? "Đang gửi..." : "Gửi lại mã?"}
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : step === 1 ? "Tiếp tục" : "Xác nhận OTP"}
            </Button>

            {step === 2 && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
                Quay lại sửa thông tin
              </Button>
            )}
          </form>

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
              Quay lại trang đăng nhập
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
