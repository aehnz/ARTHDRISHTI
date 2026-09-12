'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DemoScenario, Language, PersonaId } from '@/types';
import { getDemoState } from '@/data/intelligence';

type Message = { role: 'user' | 'assistant'; content: string };
interface AppContextType {
  language: Language; setLanguage: (language: Language) => void;
  persona: PersonaId; setPersona: (persona: PersonaId) => void;
  demoScenario: DemoScenario; setDemoScenario: (scenario: DemoScenario) => void;
  demoState: ReturnType<typeof getDemoState>;
  isDemoMode: boolean; setIsDemoMode: (value: boolean) => void;
  isOnboarded: boolean; setIsOnboarded: (value: boolean) => void;
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
  const [language, setLanguage] = useState<Language>('en');
  const [persona, setPersonaState] = useState<PersonaId>('ravi');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('tightening');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const demoState = useMemo(() => getDemoState(persona, demoScenario), [persona, demoScenario]);

  const setPersona = useCallback((next: PersonaId) => {
    setPersonaState(next);
    setDemoScenario(next === 'ananya' ? 'growth' : 'tightening');
    setChatMessages([]);
  }, []);
  const addChatMessage = useCallback((message: Message) => setChatMessages(previous => [...previous, message]), []);
  const t = useCallback((key: string) => copy[key]?.[language] ?? copy[key]?.en ?? key, [language]);

  return <AppContext.Provider value={{
    language, setLanguage, persona, setPersona, demoScenario, setDemoScenario, demoState,
    isDemoMode, setIsDemoMode, isOnboarded, setIsOnboarded,
    chatMessages, setChatMessages, addChatMessage, t,
  }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
