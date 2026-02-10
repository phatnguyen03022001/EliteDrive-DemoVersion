import { useMutation } from "@tanstack/react-query";
import { authService } from "./auth.service";
import { LoginRequest, RegisterPasswordBody, ForgotPasswordInput } from "./auth.schema";

// Chuyển từ Object sang Custom Hook (bắt đầu bằng chữ 'use')
export const useAuthQueries = () => {
  // 1. Định nghĩa các mutation ở cấp cao nhất của Hook
  const login = useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
  });

  const register = useMutation({
    mutationFn: (payload: RegisterPasswordBody) => authService.register(payload),
  });

  const resetPassword = useMutation({
    mutationFn: (payload: ForgotPasswordInput) => authService.resetPassword(payload),
  });

  // 2. Định nghĩa các mutation cho OTP
  const sendRegisterOtp = useMutation({ mutationFn: (email: string) => authService.otp.send.register(email) });
  const sendLoginOtp = useMutation({ mutationFn: (email: string) => authService.otp.send.login(email) });
  const sendForgotOtp = useMutation({ mutationFn: (email: string) => authService.otp.send.forgot(email) });

  const verifyRegisterOtp = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.otp.verify.register(email, code),
  });
  const verifyLoginOtp = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.otp.verify.login(email, code),
  });
  const verifyForgotOtp = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.otp.verify.forgot(email, code),
  });

  // 3. Trả về cấu trúc object như cũ để các file khác không phải sửa nhiều
  return {
    login,
    register,
    resetPassword,
    otp: {
      send: {
        register: sendRegisterOtp,
        login: sendLoginOtp,
        forgot: sendForgotOtp,
      },
      verify: {
        register: verifyRegisterOtp,
        login: verifyLoginOtp,
        forgot: verifyForgotOtp,
      },
    },
  };
};
