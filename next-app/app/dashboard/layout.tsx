import { ReactNode } from "react";
import { DashboardHeader } from "./components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans">
      <DashboardHeader />
      {children}
    </div>
  );
}
