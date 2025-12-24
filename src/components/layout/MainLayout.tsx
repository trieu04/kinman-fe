import * as React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { SeasonalDecor } from "../effects/SeasonalDecor";
import { SantaSleigh } from "../effects/SantaSleigh";

interface MainLayoutProps {
  onQuickAddClick: () => void;
}

export function MainLayout({ onQuickAddClick }: MainLayoutProps) {
  const [santaTrigger, setSantaTrigger] = React.useState(0);
  return (
    <div className="min-h-screen bg-background relative">
      {/* Trang trí mùa lễ (tự bật vào tháng 12/đầu tháng 1) */}
      <SeasonalDecor />
      {/* Lớp phủ ông già Noel kéo xe, chạy khi bấm Home */}
      <SantaSleigh trigger={santaTrigger} top={92} path="diagonal" />
      <Navbar onQuickAddClick={onQuickAddClick} onHomeClick={() => setSantaTrigger(v => v + 1)} />

      {/* Nội dung chính - bù cho navbar cố định */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
