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
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { evaluateLoanSuitability } from '@/data/mock';

export default function GovernancePage() {
  const assessment = evaluateLoanSuitability(500000, 36);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-teal" />
              <p className="text-sm text-muted-foreground">ARTHDRISHTI Trust Layer</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Governance Core
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              AI proposes. Governance decides. This is the fundamental architecture that makes ARTHDRISHTI responsible.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Architecture explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary/30 border border-border rounded p-6 mb-8"
        >
          <h3 className="text-sm font-medium mb-4">How ARTHDRISHTI makes decisions</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded">
              <span className="text-xs text-muted-foreground">1. Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded">
              <span className="text-xs text-muted-foreground">2. Signals</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded">
              <span className="text-xs text-muted-foreground">3. Deterministic Rules</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded">
              <span className="text-xs text-accent font-medium">4. Governance</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded">
              <span className="text-xs text-muted-foreground">5. AI Explanation</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            The deterministic engine evaluates financial suitability. The LLM provides contextual, vernacular explanation.
            The LLM never overrides the governance decision.
          </p>
        </motion.div>

        {/* Decision display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-coral/5 border border-coral/20 rounded-lg overflow-hidden mb-8"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-coral" />
              <span className="text-sm font-medium">Loan Assessment Demo</span>
            </div>
            <p className="text-3xl font-semibold text-coral tracking-tight mb-2">
              {assessment.governance.decision}
            </p>
            <p className="text-sm text-muted-foreground">
              Requested: ₹{assessment.requestedAmount.toLocaleString('en-IN')} · Tenure: {assessment.tenure} months
            </p>
          </div>

          <div className="border-t border-coral/20 p-6 space-y-5">
            {/* Reasoning */}
            <div>
              <h4 className="text-sm font-medium mb-3">Why this decision</h4>
              <div className="space-y-2">
                {assessment.governance.reasoning.slice(0, 6).map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-coral rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance checks */}
            <div>
              <h4 className="text-sm font-medium mb-3">Governance Checks</h4>
              <div className="space-y-2">
                {assessment.governance.checks.map((check, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 bg-secondary/30 rounded cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setExpandedCheck(expandedCheck === check.name ? null : check.name)}
                  >
                    <div className="flex items-center gap-3">
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-teal" />
                      ) : check.status === 'caution' ? (
                        <ShieldAlert className="w-4 h-4 text-accent" />
                      ) : (
                        <XCircle className="w-4 h-4 text-coral" />
                      )}
                      <span className="text-sm">{check.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:block">{check.detail}</span>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCheck === check.name ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative action */}
            <div className="bg-teal/5 border border-teal/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span className="text-sm font-medium text-teal">Better Next Step</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build a 90-day financial buffer first. This will strengthen your financial position before taking on new obligations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Principles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {[
            {
              icon: Eye,
              title: 'Explainable',
              desc: 'Every decision comes with clear reasoning that customers can understand.',
            },
            {
              icon: Shield,
              title: 'Protected',
              desc: 'Predatory nudge prevention ensures unsuitable products are never pushed.',
            },
            {
              icon: Lock,
              title: 'Consent-first',
              desc: 'Data is used only with explicit consent. Customers control their data.',
            },
            {
              icon: Scale,
              title: 'Fair',
              desc: 'Suitability checks ensure recommendations match actual financial circumstances.',
            },
          ].map((principle, i) => (
            <div key={i} className="bg-card border border-border rounded p-5">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center mb-3">
                <principle.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-medium mb-1">{principle.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{principle.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
