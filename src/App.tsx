import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./features/auth/components/AuthLayout";
import { LoginForm } from "./features/auth/components/LoginForm";
import { RegisterForm } from "./features/auth/components/RegisterForm";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { GroupList } from "./features/groups/components/GroupList";
import { CreateGroupForm } from "./features/groups/components/CreateGroupForm";
import { GroupDetail } from "./features/groups/components/GroupDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<GroupList />} />
          <Route path="/groups/new" element={<CreateGroupForm />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
