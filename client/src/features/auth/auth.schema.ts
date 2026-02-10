import { z } from "zod";

// --- BASE SCHEMAS (Dùng chung) ---
export const EmailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const OtpSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  code: z.string().min(6, "Mã OTP tối thiểu 6 ký tự").max(6, "Mã OTP tối đa 6 ký tự"),
});

// --- LOGIN SCHEMAS ---
export const LoginRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const LoginResponseSchema = z
  .object({
    success: z.boolean().optional(),
    data: z.object({
      token: z.string(),
    }),
  })
  .passthrough();

// --- REGISTER SCHEMAS ---
export const RegisterPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  otp: z.string().optional(),
  firstName: z.string().min(2, "Tên không được để trống"),
  lastName: z.string().min(2, "Họ không được để trống"),
  phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  role: z.enum(["CUSTOMER", "OWNER"]).default("CUSTOMER"),
});

// --- FORGOT PASSWORD SCHEMAS ---
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  code: z.string().min(4, "Mã OTP không hợp lệ"),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
});

export const OtpLoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  code: z.string().min(6, "Mã OTP phải có 6 số").max(6),
});

// --- EXPORT TYPES ---
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type OtpLoginInput = z.infer<typeof OtpLoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterPasswordBody = z.infer<typeof RegisterPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type SendOtpInput = z.infer<typeof EmailSchema>;
export type VerifyOtpInput = z.infer<typeof OtpSchema>;
