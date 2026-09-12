'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrendingUp,
  Shield,
  MessageSquare,
  Activity,
  Globe2,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Language } from '@/types';
import { useApp } from '@/context/AppContext';

const navItems = [
  { id: 'landing', label: 'Home', icon: Home, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, href: '/dashboard' },
  { id: 'financial-life', label: 'Financial Life', icon: Activity, href: '/financial-life' },
  { id: 'insights', label: 'Insights', icon: TrendingUp, href: '/insights' },
  { id: 'protection', label: 'Protection', icon: Shield, href: '/protection' },
  { id: 'ask', label: 'Ask ARTHDRISHTI', icon: MessageSquare, href: '/ask' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, isDemoMode, setIsDemoMode } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ARTHDRISHTI</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    isActive(item.href)
                      ? 'text-foreground bg-secondary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-secondary rounded p-0.5">
                {(['en', 'hi', 'hinglish'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      language === lang
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang === 'hinglish' ? 'Hinglish' : lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Demo toggle */}
              {isDemoMode && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-subtle" />
                  <span className="text-xs font-medium text-accent">Demo</span>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-secondary rounded transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-64 bg-background border-r border-border p-4 pt-20">
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                    isActive(item.href)
                      ? 'text-foreground bg-secondary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center gap-1 bg-secondary rounded p-0.5">
                {(['en', 'hi', 'hinglish'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                      language === lang
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {lang === 'hinglish' ? 'Hing' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </div>
  );
}
