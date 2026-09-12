'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthContext, DemoState, Language } from '@/types';
import { api } from '@/lib/api';

type Message = { role: 'user' | 'assistant'; content: string };
interface AppContextType {
  language: Language; setLanguage: (language: Language) => void;
  demoState: DemoState;
  auth: AuthContext | null; isSessionLoading: boolean;
  isIntelligenceLoading: boolean; intelligenceError: string | null; refreshIntelligence: () => void;
  isOnboarded: boolean;
  refreshSession: () => Promise<AuthContext | null>;
  logout: () => Promise<void>;
  chatMessages: Message[]; setChatMessages: (messages: Message[]) => void;
  addChatMessage: (message: Message) => void; t: (key: string) => string;
}

const copy: Record<string, Record<Language, string>> = {
  'nav.overview': { en: 'Overview', hi: 'सारांश', hinglish: 'Overview' },
  'nav.money': { en: 'Money', hi: 'पैसा', hinglish: 'Money' },
  'nav.decisions': { en: 'Decisions', hi: 'निर्णय', hinglish: 'Decisions' },
  'nav.protection': { en: 'Protection', hi: 'सुरक्षा', hinglish: 'Protection' },
  'nav.ask': { en: 'Ask', hi: 'पूछें', hinglish: 'Ask' },
  'dashboard.eyebrow': { en: 'Financial health', hi: 'वित्तीय स्वास्थ्य', hinglish: 'Financial health' },
  'dashboard.tightening': { en: 'Your finances are tightening, but you still have room to recover.', hi: 'आपकी वित्तीय स्थिति पर दबाव है, लेकिन सुधार की गुंजाइश अभी भी है।', hinglish: 'Finances tighten ho rahe hain, lekin recovery ke liye abhi bhi room hai.' },
  'dashboard.strong': { en: 'Your financial position is strong. Now make that strength work harder.', hi: 'आपकी वित्तीय स्थिति मजबूत है। अब इस मजबूती को आगे बढ़ाइए।', hinglish: 'Aapki financial position strong hai. Ab is strength ko goals ke liye use karein.' },
  'common.why': { en: 'See why', hi: 'कारण देखें', hinglish: 'Why dekhein' },
  'common.updated': { en: 'Updated today', hi: 'आज अपडेट किया गया', hinglish: 'Aaj updated' },
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthContext | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [isSessionLoading, setSessionLoading] = useState(true);
  const [isIntelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);

  const loadOverview = useCallback(async (context: AuthContext) => {
    if (context.onboarding.status !== 'complete') {
      setDemoState(null);
      return;
    }
    setIntelligenceLoading(true);
    setIntelligenceError(null);
    try { setDemoState(await api.overview()); }
    catch (error) { setIntelligenceError(error instanceof Error ? error.message : 'ARTHDRISHTI intelligence service is temporarily unavailable.'); }
    finally { setIntelligenceLoading(false); }
  }, []);

  const refreshSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const context = await api.authMeOptional();
      setAuth(context);
      if (context) {
        setLanguageState(context.user.languagePreference);
        await loadOverview(context);
      } else setDemoState(null);
      return context;
    } finally { setSessionLoading(false); }
  }, [loadOverview]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => { void refreshSession(); }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [refreshSession]);

  const refreshIntelligence = useCallback(() => { if (auth) void loadOverview(auth); }, [auth, loadOverview]);
  const setLanguage = useCallback((next: Language) => { setLanguageState(next); if (auth) void api.updateLanguage(next).then(user => setAuth(previous => previous ? { ...previous, user } : previous)); }, [auth]);
  const logout = useCallback(async () => { await api.logout(); setAuth(null); setDemoState(null); setChatMessages([]); }, []);
  const addChatMessage = useCallback((message: Message) => setChatMessages(previous => [...previous, message]), []);
  const t = useCallback((key: string) => copy[key]?.[language] ?? copy[key]?.en ?? key, [language]);

  return <AppContext.Provider value={{
    language, setLanguage, demoState: demoState as DemoState, auth, isSessionLoading,
    isIntelligenceLoading, intelligenceError, refreshIntelligence,
    isOnboarded: auth?.onboarding.status === 'complete',
    refreshSession, logout, chatMessages, setChatMessages, addChatMessage, t,
  }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
