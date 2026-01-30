"use client";

import Link from "next/link";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export function DashboardHeader() {
  return (
    <nav className="border-b border-[#eeeeee] bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            KLOAK
          </Link>

          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-[#015FFD]"
            >
              Distributions
            </Link>
            <Link
              href="#"
              className="text-[#666666] hover:text-[#111111]"
            >
              Compliance
            </Link>
            <Link
              href="#"
              className="text-[#666666] hover:text-[#111111]"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
