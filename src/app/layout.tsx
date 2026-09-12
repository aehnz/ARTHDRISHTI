import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'ARTHDRISHTI — Financial Intelligence for Bharat', template: '%s · ARTHDRISHTI' },
  description: 'A governed financial intelligence system that understands, protects, explains and helps people grow.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><AppProvider><AppShell>{children}</AppShell><Toaster /></AppProvider></body></html>;
}
