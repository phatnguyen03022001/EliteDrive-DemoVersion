"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpSchema, VerifyOtpInput } from "../auth.schema";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";

type Props = {
  email: string;
  onVerify: (data: VerifyOtpInput) => void;
  isLoading?: boolean;
  onResend?: () => void;
};

export function OtpForm({ email, onVerify, isLoading, onResend }: Props) {
  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      email: email,
      code: "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Xác thực mã OTP</h2>
          <p className="text-sm text-muted-foreground">
            Mã xác thực đã được gửi đến <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onVerify)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="sr-only">Mã OTP</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="000000"
                    className="h-14 text-center text-3xl font-black tracking-[0.5em] focus-visible:ring-primary/50 shadow-sm"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác nhận mã OTP"
              )}
            </Button>

            {onResend && (
              <div className="flex items-center justify-center text-sm">
                <span className="text-muted-foreground">Không nhận được mã?</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onResend}
                  disabled={isLoading}
                  className="px-2 font-bold text-primary hover:no-underline">
                  Gửi lại
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
