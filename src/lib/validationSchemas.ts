import { z } from "zod";

// ========== Login Schema ==========
export const loginSchema = z.object({
  username: z.string()
    .min(1, "Username không được để trống")
    .min(3, "Username tối thiểu 3 ký tự"),
  password: z.string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ========== Signup Schema ==========
export const signupSchema = z.object({
  name: z.string()
    .min(1, "Họ và tên không được để trống")
    .min(2, "Họ và tên tối thiểu 2 ký tự"),
  username: z.string()
    .min(1, "Tên người dùng không được để trống")
    .min(3, "Tên người dùng tối thiểu 3 ký tự"),
  email: z.string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string()
    .min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;
