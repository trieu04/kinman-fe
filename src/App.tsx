import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { QuickAddModal } from "./components/expense/QuickAddModal";
import { LazyBoundary } from "./components/ui/LazyBoundary";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { useRealtimeConnection } from "./hooks/useRealtime";
import { useRealtimeSync } from "./services/realtimeService";
import "./index.css";

// Lazy load heavy components to reduce initial bundle
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Transactions = React.lazy(() => import("./pages/Transactions"));
const Groups = React.lazy(() => import("./pages/Groups"));
const GroupDetail = React.lazy(() => import("./components/group/GroupDetail"));
const Settings = React.lazy(() => import("./pages/Settings"));
const UserReport = React.lazy(() => import("./pages/UserReport"));
const GroupReport = React.lazy(() => import("./components/group/GroupReport"));

function App() {
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const { isAuthenticated, fetchUser } = useAuthStore();
  const { resolvedTheme } = useThemeStore();

  // Enable realtime connection
  useRealtimeConnection();
  useRealtimeSync();

  // Check auth on mount
  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Listen for external open-quick-add events
  React.useEffect(() => {
    const handleOpenQuickAdd = () => setQuickAddOpen(true);
    window.addEventListener("open-quick-add", handleOpenQuickAdd);
    return () => window.removeEventListener("open-quick-add", handleOpenQuickAdd);
  }, []);

  // Check for daily reminder
  React.useEffect(() => {
    const checkReminder = () => {
      try {
        const enabled = localStorage.getItem("reminderEnabled") === "true";
        const time = localStorage.getItem("reminderTime");
        const lastSent = localStorage.getItem("lastNotificationDate");
        const today = new Date().toDateString();

        if (enabled && time && lastSent !== today) {
          const [hours, minutes] = time.split(":").map(Number);
          const now = new Date();

          // Check if it's time (or passed time within last hour to be safe, but usually just >= is enough if we track date)
          // Actually, we want to trigger it IF current time >= target time AND we haven't sent it today.
          if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
            // Send notification
            if (Notification.permission === "granted") {
              const notification = new Notification("Time to record your expenses!", {
                body: "Click here to add a new note/transaction.",
                icon: "/favicon.ico", // Assuming standard favicon or icon
              });

              notification.onclick = () => {
                window.focus();
                setQuickAddOpen(true);
              };

              localStorage.setItem("lastNotificationDate", today);
            }
          }
        }
      } catch (e) {
        console.error("Error checking reminder:", e);
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    // Initial check
    checkReminder();

    return () => clearInterval(interval);
  }, []);

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
            <Route path="/" element={<LazyBoundary><Dashboard /></LazyBoundary>} />
            <Route path="/transactions" element={<LazyBoundary><Transactions /></LazyBoundary>} />
            <Route path="/groups" element={<LazyBoundary><Groups /></LazyBoundary>} />
            <Route path="/groups/:id" element={<LazyBoundary><GroupDetail /></LazyBoundary>} />
            <Route path="/reports/user" element={<LazyBoundary><UserReport /></LazyBoundary>} />
            <Route path="/reports/group/:groupId" element={<LazyBoundary><GroupReport /></LazyBoundary>} />
            <Route path="/settings" element={<LazyBoundary><Settings /></LazyBoundary>} />
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
