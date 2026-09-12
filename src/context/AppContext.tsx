'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Language, DemoScenario } from '@/types';
import { getDemoState } from '@/data/mock';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => void;
  demoState: ReturnType<typeof getDemoState>;
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  setChatMessages: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => void;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('tightening');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const demoState = getDemoState(demoScenario);

  const addChatMessage = useCallback((message: { role: 'user' | 'assistant'; content: string }) => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const t = useCallback((key: string): string => {
    const translations: Record<string, Record<Language, string>> = {
      'nav.overview': { en: 'Overview', hi: 'सारांश', hinglish: 'Overview' },
      'nav.financialLife': { en: 'Financial Life', hi: 'वित्तीय जीवन', hinglish: 'Financial Life' },
      'nav.insights': { en: 'Insights', hi: 'अंतर्दृष्टि', hinglish: 'Insights' },
      'nav.protection': { en: 'Protection', hi: 'सुरक्षा', hinglish: 'Protection' },
      'nav.ask': { en: 'Ask ARTHDRISHTI', hi: 'ARTHDRISHTI से पूछें', hinglish: 'Ask ARTHDRISHTI' },
      'dashboard.headline': { en: "Here's what ARTHDRISHTI understands about your financial life.", hi: 'ARTHDRISHTI आपके वित्तीय जीवन को समझता है।', hinglish: "ARTHDRISHTI samajhta hai aapke financial life ke baare mein." },
      'financialState.title': { en: 'Financial State', hi: 'वित्तीय स्थिति', hinglish: 'Financial State' },
      'whatChanged.title': { en: 'What changed?', hi: 'क्या बदलाव हुआ?', hinglish: 'What changed?' },
      'whatMayMatter.title': { en: 'What may matter next', hi: 'आगे क्या महत्वपूर्ण हो सकता है', hinglish: 'What may matter next' },
      'loan.notRecommended': { en: 'NOT RECOMMENDED RIGHT NOW', hi: 'अभी अनुशंसित नहीं है', hinglish: 'NOT RECOMMENDED RIGHT NOW' },
      'governance.title': { en: 'ARTHDRISHTI Trust Layer', hi: 'ARTHDRISHTI विश्वास परत', hinglish: 'ARTHDRISHTI Trust Layer' },
      'cta.explore': { en: 'Explore my financial life', hi: 'मेरा वित्तीय जीवन देखें', hinglish: 'Explore my financial life' },
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  }, [language]);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      demoScenario, setDemoScenario,
      demoState,
      isDemoMode, setIsDemoMode,
      isOnboarded, setIsOnboarded,
      chatMessages, setChatMessages, addChatMessage,
      t,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
