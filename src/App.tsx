import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { QuickAddModal } from "./components/expense/QuickAddModal";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Groups } from "./pages/Groups";
import { GroupDetail } from "./pages/GroupDetail";
import { Settings } from "./pages/Settings";
import { UserReport } from "./pages/UserReport";
import { GroupReport } from "./pages/GroupReport";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import "./index.css";

function App() {
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const { isAuthenticated, fetchUser } = useAuthStore();
  const { resolvedTheme } = useThemeStore();

  // Check auth on mount
  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <div className={resolvedTheme === "dark" ? "dark" : ""}>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Signup />
            }
          />

          {/* Protected Routes */}
          <Route element={(
            <ProtectedRoute>
              <MainLayout onQuickAddClick={() => setQuickAddOpen(true)} />
            </ProtectedRoute>
          )}
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/reports/user" element={<UserReport />} />
            <Route path="/reports/group/:groupId" element={<GroupReport />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Quick Add Modal - Global */}
        <QuickAddModal
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          onSuccess={() => {
            // Optionally refresh data
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
