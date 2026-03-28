import type { Metadata } from "next";
import "./globals.css";
import { KloakWalletProvider } from "./providers/AleoWalletProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BalanceProvider } from "./providers/balance-provider";
import { AppHeader } from "@/components/app-header";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL!),
  title: {
    default: "Kloak",
    template: "%s",
  },
  description: "Private distribution of value and access.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark font-sans", geist.variable)}>
      <body className="antialiased min-h-screen ">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <KloakWalletProvider>
          <BalanceProvider>
            <div className="relative min-h-screen">
              <AppHeader />
              <div className="pt-28">
                {children}
              </div>
            </div>
          </BalanceProvider>
        </KloakWalletProvider>
      </body>
    </html>
  );
}
