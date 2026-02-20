import type { Metadata } from "next";
import "./globals.css";
import { KloakWalletProvider } from "./providers/AleoWalletProvider";

export const metadata: Metadata = {
  title: "Kloak",
  description: "Private distribution of value and access."

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        <KloakWalletProvider>{children}</KloakWalletProvider>
      </body>
    </html>
  );
}
