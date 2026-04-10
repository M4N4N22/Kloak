import type { Metadata } from "next";
import "./globals.css";
import "@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css";
import { KloakWalletProvider } from "./providers/AleoWalletProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BalanceProvider } from "./providers/balance-provider";
import { AppShell } from "./providers/app-shell";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL!),
  applicationName: "Kloak",
  title: {
    default: "Kloak",
    template: "%s | Kloak",
  },
  description: "Payment links with private settlement, selective disclosure, and proof verification built on Aleo.",
  openGraph: {
    title: "Kloak",
    description: "Payment links with private settlement, selective disclosure, and proof verification built on Aleo.",
    siteName: "Kloak",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kloak",
    description: "Payment links with private settlement, selective disclosure, and proof verification built on Aleo.",
  },
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
            <AppShell>{children}</AppShell>
          </BalanceProvider>
        </KloakWalletProvider>
      </body>
    </html>
  );
}
