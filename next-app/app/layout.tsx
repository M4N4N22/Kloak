import type { Metadata } from "next";
import "./globals.css";
import { KloakWalletProvider } from "./providers/AleoWalletProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BalanceProvider } from "./providers/balance-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Kloak",
  description: "Private distribution of value and access.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <body className="antialiased">
        <KloakWalletProvider>
          <BalanceProvider>
            {children}
          </BalanceProvider>
        </KloakWalletProvider>
      </body>
    </html>
  );
}