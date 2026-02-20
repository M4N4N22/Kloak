import { ReactNode } from "react";
import Link from "next/link";

export default function ClaimLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#015FFD] selection:text-white">
      
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#eeeeee]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">KLOAK</div>

          <Link
            href="/"
            className="text-sm font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {children}
    </div>
  );
}