'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Eye,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getConsentItems } from '@/data/mock';

export default function ConsentPage() {
  const { language } = useApp();
  const [consents, setConsents] = useState(getConsentItems());
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const toggleConsent = (id: string) => {
    setConsents(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: c.status === 'consented' ? 'not_consented' : 'consented' as const }
          : c
      )
    );
  };

  const consentedCount = consents.filter(c => c.status === 'consented').length;
  const totalCount = consents.length;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-teal" />
              <p className="text-sm text-muted-foreground">Privacy & Consent Center</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Your data, your control
            </h1>
            <p className="text-muted-foreground">
              ARTHDRISHTI uses your financial data to provide personalized insights. You control what data is used and why.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-teal" />
              <span className="text-sm font-medium">Consented</span>
            </div>
            <p className="text-3xl font-semibold font-financial">{consentedCount}/{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Data categories active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Transparency</span>
            </div>
            <p className="text-3xl font-semibold font-financial">100%</p>
            <p className="text-xs text-muted-foreground mt-1">Every decision explained</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Governance</span>
            </div>
            <p className="text-3xl font-semibold font-financial">AI + Rules</p>
            <p className="text-xs text-muted-foreground mt-1">Decisions by governance, not AI alone</p>
          </motion.div>
        </div>

        {/* Privacy statement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-secondary/30 border border-border rounded p-6 mb-8"
        >
          <h3 className="text-sm font-medium mb-2">ARTHDRISHTI does not use personalization as permission to push unsuitable products.</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your financial data is used solely to provide you with personalized insights and responsible recommendations.
            We do not sell your data, and we do not use your financial behavior to target you with products that may not be suitable for your situation.
            This system is designed with privacy, consent, and responsible personalization in mind.
          </p>
        </motion.div>

        {/* Consent items */}
        <div className="space-y-4">
          {consents.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="bg-card border border-border rounded p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium">{item.category}</h3>
                    {item.required && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground uppercase tracking-wider">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground/80">Purpose: {item.purpose}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.dataPoints.map((point, j) => (
                      <span key={j} className="text-[10px] px-1.5 py-0.5 bg-secondary/50 rounded text-muted-foreground">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => !item.required && toggleConsent(item.id)}
                  disabled={item.required}
                  className={`flex-shrink-0 px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                    item.status === 'consented'
                      ? 'bg-teal/10 text-teal'
                      : 'bg-secondary text-muted-foreground'
                  } ${item.required ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-80'}`}
                >
                  {item.status === 'consented' ? 'Consented' : 'Not Consented'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          <p>ARTHDRISHTI is designed with privacy, consent, and responsible personalization in mind.</p>
          <p className="mt-1">This is a hackathon prototype. In production, this would comply with applicable data protection regulations.</p>
        </motion.div>
      </div>
    </div>
  );
}
