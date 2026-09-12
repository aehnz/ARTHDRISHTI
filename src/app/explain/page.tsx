'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Activity,
  Brain,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { evaluateLoanSuitability, getSignals, getFinancialState } from '@/data/mock';

export default function ExplainabilityPage() {
  const { language } = useApp();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const assessment = evaluateLoanSuitability(500000, 36);
  const state = getFinancialState();
  const signals = getSignals();

  const pipelineSteps = [
    {
      id: 1,
      icon: Database,
      title: 'Data Used',
      color: 'navy',
      description: 'ARTHDRISHTI accessed the following data sources to build your financial context:',
      items: [
        { label: 'Salary credits', detail: '12 months of history' },
        { label: 'EMI history', detail: '6 months of payment records' },
        { label: 'Savings trend', detail: '6 months of transfer patterns' },
        { label: 'Transaction behavior', detail: '90 days of spending data' },
        { label: 'Recurring payments', detail: '5 active subscriptions' },
      ],
    },
    {
      id: 2,
      icon: Activity,
      title: 'Signals Detected',
      color: 'accent',
      description: 'From the raw data, ARTHDRISHTI identified these financial signals:',
      items: [
        { label: 'Income stable', detail: 'Consistent for 12 months' },
        { label: 'Existing EMI elevated', detail: '38.4% of income (threshold: 40%)' },
        { label: 'Buffer declining', detail: '2.4 months (threshold: 3 months)' },
        { label: 'Cash-flow volatility', detail: 'Trend declining over 6 weeks' },
        { label: 'Discretionary spending', detail: '+11% increase in 30 days' },
      ],
    },
    {
      id: 3,
      icon: Brain,
      title: 'Interpretation',
      color: 'coral',
      description: 'ARTHDRISHTI interpreted the signals in the context of your financial life:',
      items: [
        { label: 'Debt capacity', detail: 'Limited. Current EMI burden near threshold.' },
        { label: 'Resilience', detail: 'Reduced. Buffer below recommended minimum.' },
        { label: 'Trend', detail: 'Concerning. Cash flow weakening.' },
        { label: 'Action priority', detail: 'Buffer building > new obligations' },
      ],
    },
    {
      id: 4,
      icon: Shield,
      title: 'Governance Check',
      color: 'teal',
      description: 'The governance layer evaluated this request against safety rules:',
      items: assessment.governance.checks.map(c => ({
        label: c.name,
        detail: c.detail,
        status: c.status,
      })),
    },
    {
      id: 5,
      icon: CheckCircle2,
      title: 'Output',
      color: 'navy',
      description: 'The final recommendation, with full reasoning:',
      items: [
        { label: 'Decision', detail: assessment.governance.decision, highlight: true },
        { label: 'Alternative', detail: 'Build 90-day buffer first' },
        { label: 'Confidence', detail: '85%' },
        { label: 'Next action', detail: 'Review spending, reduce discretionary, save more' },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-2">Transparency & Reasoning</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Why did ARTHDRISHTI say this?
            </h1>
            <p className="text-muted-foreground">
              Every recommendation comes with a complete reasoning trail. This is explainability in action.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded p-6 mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Scenario: Loan Assessment
          </h3>
          <p className="text-sm text-muted-foreground">
            Customer asked: <span className="text-foreground font-medium">&ldquo;Mujhe ₹5 lakh ka personal loan lena chahiye?&rdquo;</span>
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="space-y-3">
          {pipelineSteps.map((step, i) => {
            const isExpanded = expandedStep === i;
            const colorMap = ({
              navy: { bg: 'bg-primary', text: 'text-primary', border: 'border-primary/20', light: 'bg-primary/5' },
              accent: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent/20', light: 'bg-accent/5' },
              coral: { bg: 'bg-coral', text: 'text-coral', border: 'border-coral/20', light: 'bg-coral/5' },
              teal: { bg: 'bg-teal', text: 'text-teal', border: 'border-teal/20', light: 'bg-teal/5' },
            } as const)[step.color]!;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                  className={`w-full ${colorMap.light} border ${colorMap.border} rounded p-5 text-left transition-all hover:shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${colorMap.bg} rounded flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{step.title}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">Step {step.id} of 5</span>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`${colorMap.light} border-x border-b ${colorMap.border} rounded-b p-5 -mt-1`}>
                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                        <div className="space-y-2.5">
                          {step.items.map((item, j) => (
                            <div key={j} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                              <span className="text-sm">{item.label}</span>
                              <div className="text-right">
                                <span className={`text-sm ${(item as any).highlight ? 'font-semibold text-coral' : 'text-muted-foreground'}`}>
                                  {(item as any).detail}
                                </span>
                                {(item as any).status && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                    (item as any).status === 'passed'
                                      ? 'bg-teal/10 text-teal'
                                      : 'bg-accent/10 text-accent'
                                  }`}>
                                    {(item as any).status.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
