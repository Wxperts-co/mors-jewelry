import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreLayoutShell } from "@/components/layouts/StoreLayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mor's Jewelry & Repair | Fine Gold, Diamonds & Custom Jewelry",
  description: "Exquisite fine jewelry, certified diamonds, gold, silver, and master repair services.",
  icons: {
    icon: "/logo/favicon.webp",
    shortcut: "/logo/favicon.webp",
    apple: "/logo/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-neutral-100 selection:bg-[#D4AF37] selection:text-black">
        <StoreLayoutShell>{children}</StoreLayoutShell>
      </body>
    </html>
  );
}
