'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getFallbackResponse } from '@/lib/ai-service';

const SUGGESTED_PROMPTS = [
  { icon: '💳', label: 'Mujhe loan kyun nahi lena chahiye?', hint: 'loan' },
  { icon: '📊', label: 'Mere kharche kahan badhe?', hint: 'spending' },
  { icon: '💰', label: 'Why is my savings buffer falling?', hint: 'buffer' },
  { icon: '🛡️', label: 'Explain my financial health', hint: 'health' },
  { icon: '🎯', label: 'How can I save ₹10,000 this month?', hint: 'save' },
];

export default function AskPage() {
  const { language, demoState, addChatMessage, chatMessages } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    addChatMessage(userMessage);
    setIsLoading(true);
    setInput('');

    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const context = {
      customerName: demoState.customer.name,
      financialState: {
        monthlyIncome: demoState.financialState.income.monthly,
        existingEmi: demoState.financialState.debt.existingEmi,
        savings: demoState.financialState.savings.total,
        bufferMonths: demoState.financialState.savings.bufferMonths,
        cashFlowTrend: demoState.financialState.income.stability,
        emiBurdenRatio: demoState.financialState.debt.emiBurdenRatio,
        riskLevel: demoState.financialState.risk.level,
      },
      recentInsights: demoState.insights.slice(0, 3).map(i => ({ title: i.title, type: i.type })),
      language,
    };

    const response = getFallbackResponse(input, context);
    addChatMessage({ role: 'assistant', content: response });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <p className="text-sm text-muted-foreground">ARTHDRISHTI AI Assistant</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Ask ARTHDRISHTI</h1>
            <p className="text-muted-foreground">
              Ask anything about your financial life. I understand Hindi, English, and Hinglish.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {chatMessages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Ask about your spending, savings, debt, or any financial concern. I understand Hindi, English, and Hinglish.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-lg p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {msg.role === 'assistant' ? 'ARTHDRISHTI' : 'You'}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {chatMessages.length === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => setInput(prompt.label)}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded hover:border-foreground/10 transition-all text-left group"
                >
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center flex-shrink-0 text-lg">
                    {prompt.icon}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{prompt.label}</span>
                </motion.button>
              ))}
            </div>
          )}

          <div className="sticky bottom-4 pt-4">
            <div className="bg-card border border-border rounded-lg shadow-lg p-2">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Ask about your financial life..."
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-sm px-3 py-2 max-h-32 min-h-[40px]"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
