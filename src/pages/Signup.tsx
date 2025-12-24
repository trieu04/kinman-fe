import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, AtSign, Loader2, Wallet } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuthStore } from "../stores/authStore";
import bgImage from "../assets/images/bg1.png";
import { signupSchema, type SignupFormData } from "../lib/validationSchemas";
import type { SignUpDto } from "../types";
import { SeasonalDecor } from "../components/effects/SeasonalDecor";

export function Signup() {
  const navigate = useNavigate();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    clearError();
    const { confirmPassword, ...signupData } = data;
    try {
      await signUp(signupData as SignUpDto);
      navigate("/", { replace: true });
    }
    catch {
      // Error is handled by the store
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Trang trí mùa lễ trên trang đăng ký */}
      <SeasonalDecor />
      {/* Phần tử trang trí nền */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-2">
          {/* Biểu tượng (Logo) */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-amber-500 flex items-center justify-center shadow-2xl shadow-primary/30">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
            <CardDescription className="text-base">
              Bắt đầu quản lý chi tiêu thông minh
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoComplete="name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Tên người dùng
                {" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  placeholder="username"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoComplete="username"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <span className="text-xs text-destructive">{errors.username.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
                {" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
                {" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoComplete="new-password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-destructive">{errors.password.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu
                {" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-linear-to-r from-primary to-amber-500 hover:opacity-90 text-base font-semibold shadow-lg shadow-primary/25 mt-2"
              disabled={isLoading}
            >
              {isLoading
                ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang tạo tài khoản...
                    </>
                  )
                : (
                    "Đăng ký"
                  )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Đã có tài khoản?
            {" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;
