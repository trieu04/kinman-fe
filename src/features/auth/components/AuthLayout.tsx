import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
            KinMan
          </h1>
          <p className="text-muted-foreground">Manage your finances with ease</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
