import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAuthQueries } from "../features/auth/auth.queries";
import { LoginRequest, LoginResponse } from "../features/auth/auth.schema";

interface DecodedToken {
  role: "ADMIN" | "OWNER" | "CUSTOMER";
  sub: string;
  email: string;
}
export const useAuth = () => {
  const router = useRouter();
  const authQueries = useAuthQueries();

  // Helper logic để xử lý sau khi có Token (Dùng chung cho cả Login mật khẩu và Login OTP)
  const handleAuthSuccess = (token: string) => {
    Cookies.set("token", token, { expires: 7, path: "/" });
    toast.success("Đăng nhập thành công!");

    const decoded = jwtDecode<DecodedToken>(token);

    // Điều hướng dựa trên Role
    if (decoded.role === "ADMIN") {
      router.push("/admin/kyc");
    } else if (decoded.role === "OWNER") {
      router.push("/owner/cars");
    } else {
      router.push("/customer/cars");
    }
    router.refresh();
  };

  const handleLogin = (formData: LoginRequest) => {
    authQueries.login.mutate(formData, {
      onSuccess: (res: LoginResponse) => {
        const token = res.data?.token;
        if (token) handleAuthSuccess(token);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Đăng nhập thất bại";
        toast.error(typeof msg === "string" ? msg : "Sai thông tin đăng nhập");
      },
    });
  };

  // --- MỚI: Xử lý Verify OTP Đăng nhập ---
  const handleVerifyLoginOtp = (data: { email: string; code: string }) => {
    authQueries.otp.verify.login.mutate(data, {
      onSuccess: (res: any) => {
        const token = res.data?.token;
        if (token) handleAuthSuccess(token);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn";
        toast.error(msg);
      },
    });
  };

  const handleLogout = () => {
    Cookies.remove("token");
    toast.success("Đã đăng xuất");
    router.push("/login");
    router.refresh();
  };

  return {
    login: handleLogin,
    verifyLoginOtp: handleVerifyLoginOtp, // Trả ra hàm mới này
    logout: handleLogout,
    register: authQueries.register.mutate,
    resetPassword: authQueries.resetPassword.mutate,

    sendOtp: authQueries.otp.send,
    verifyOtp: authQueries.otp.verify,

    registerLoading: authQueries.register.isPending,
    verifyRegisterOtpLoading: authQueries.otp.verify.register.isPending,
    sendOtpRegisterLoading: authQueries.otp.send.register.isPending,

    isLoading: authQueries.login.isPending || authQueries.otp.verify.login.isPending, // Thêm state loading cho verify login
    isOtpLoading:
      authQueries.otp.send.login.isPending ||
      authQueries.otp.send.register.isPending ||
      authQueries.otp.send.forgot.isPending,
  };
};
