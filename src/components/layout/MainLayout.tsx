import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  onQuickAddClick: () => void;
}

export function MainLayout({ onQuickAddClick }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onQuickAddClick={onQuickAddClick} />

      {/* Main Content - Account for fixed navbar */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
