import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARTHDRISHTI — Financial Intelligence for Bharat",
  description: "Your bank sees transactions. ARTHDRISHTI sees financial life. An intelligent banking layer that understands financial behavior, explains what matters, and protects customers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
