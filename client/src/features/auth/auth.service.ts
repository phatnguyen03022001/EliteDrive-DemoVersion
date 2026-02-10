import axios from "@/lib/axios";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  LoginRequest,
  LoginResponse,
  RegisterPasswordBody,
  ForgotPasswordSchema,
  ForgotPasswordInput,
  EmailSchema,
  OtpSchema,
} from "./auth.schema";

export const authService = {
  // --- LOGIN ---
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const validatedPayload = LoginRequestSchema.parse(payload);
    const res = await axios.post("/api/auth/login", validatedPayload);
    return LoginResponseSchema.parse(res);
  },

  // --- REGISTER ---
  register: async (data: RegisterPasswordBody) => {
    return axios.post("/api/auth/register", data);
  },

  // --- FORGOT & RESET PASSWORD ---
  resetPassword: async (data: ForgotPasswordInput) => {
    ForgotPasswordSchema.parse(data);
    return axios.post("/api/auth/forgot-password", data);
  },

  // --- OTP SERVICES (Gom tất cả các loại OTP về đây) ---
  otp: {
    // Gửi OTP cho từng mục đích
    send: {
      register: (email: string) => {
        EmailSchema.parse({ email });
        return axios.post("/api/auth/otp/register", { email });
      },
      login: (email: string) => {
        EmailSchema.parse({ email });
        return axios.post("/api/auth/otp/login", { email });
      },
      forgot: (email: string) => {
        EmailSchema.parse({ email });
        return axios.post("/api/auth/otp/forgot-password", { email });
      },
    },

    // Xác thực OTP cho từng mục đích
    verify: {
      register: (email: string, code: string) => {
        OtpSchema.parse({ email, code });
        return axios.post("/api/auth/verify-register-otp", { email, code });
      },
      login: (email: string, code: string) => {
        OtpSchema.parse({ email, code });
        return axios.post("/api/auth/verify-login-otp", { email, code });
      },
      forgot: (email: string, code: string) => {
        OtpSchema.parse({ email, code });
        return axios.post("/api/auth/verify-forgot-otp", { email, code });
      },
    },
  },

  // --- REFRESH TOKEN ---

  getProfile: async () => {
    const res = await axios.get("/api/profile");
    return res.data;
  },
};
