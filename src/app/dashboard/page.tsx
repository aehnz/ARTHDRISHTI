'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Activity,
  Wallet,
  CreditCard,
  PiggyBank,
  Shield,
  Zap,
  MessageSquare,
  DollarSign,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { getCustomer, getFinancialState, getSignals, getRecommendations, getInsights } from '@/data/mock';
import Link from 'next/link';
import type { FinancialState } from '@/types';

function formatCurrency(amount: number, short = false): string {
  if (short) {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

const BUFFER_DATA = [
  { month: 'May', value: 3.2 },
  { month: 'Jun', value: 2.9 },
  { month: 'Jul', value: 2.8 },
  { month: 'Aug', value: 2.6 },
  { month: 'Sep', value: 2.4 },
];

const SPENDING_DATA = [
  { name: 'Essential', value: 41800, fill: '#1A1F36' },
  { name: 'EMIs', value: 31500, fill: '#E8A838' },
  { name: 'Discretionary', value: 34200, fill: '#D45555' },
];

function round(n: number): number {
  return Math.round(n);
}

function FinancialStateRadial({ state }: { state: FinancialState }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const radius = 120;
  const cx = 150;
  const cy = 150;

  const segments = [
    { label: 'Income', value: state.income.monthly, max: 100000, color: '#1A1F36', startAngle: 90 },
    { label: 'Essential', value: state.spending.essential, max: 50000, color: '#4A9B8E', startAngle: 18 },
    { label: 'Discretionary', value: state.spending.discretionary, max: 50000, color: '#D45555', startAngle: -54 },
    { label: 'EMIs', value: state.debt.existingEmi, max: 40000, color: '#E8A838', startAngle: -126 },
    { label: 'Savings', value: state.savings.total / 12, max: 30000, color: '#8B7BB5', startAngle: 162 },
  ];

  // Server: show a static placeholder that matches the center label layout
  // Client: show the animated radial chart (framer-motion SVG paths differ SSR/client)
  if (!mounted) {
    return (
      <div className="relative">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
          <circle cx={cx} cy={cy} r="50" fill="#FAFAF8" />
          <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs fill-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            Buffer
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="text-lg font-semibold fill-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            {state.savings.bufferMonths}mo
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
        {segments.map((seg, i) => {
          const angle = ((seg.value / seg.max) * 360) * (Math.PI / 180);
          const startRad = (seg.startAngle - 90) * (Math.PI / 180);
          const endRad = startRad + angle;

          const x1 = Math.round(cx + radius * Math.cos(startRad));
          const y1 = Math.round(cy + radius * Math.sin(startRad));
          const x2 = Math.round(cx + radius * Math.cos(endRad));
          const y2 = Math.round(cy + radius * Math.sin(endRad));

          const largeArc = angle > Math.PI ? 1 : 0;

          const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <motion.path
              key={i}
              d={pathData}
              fill={seg.color}
              opacity={0.85}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.85, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="hover:opacity-100 cursor-pointer transition-opacity"
              style={{ transformOrigin: '150px 150px' }}
            />
          );
        })}
        {/* Center */}
        <circle cx={cx} cy={cy} r="50" fill="#FAFAF8" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs fill-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Buffer
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="text-lg font-semibold fill-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          {state.savings.bufferMonths}mo
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { language, t } = useApp();
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [showGovernance, setShowGovernance] = useState(false);

  const customer = getCustomer();
  const state = getFinancialState();
  const signals = getSignals();
  const recommendations = getRecommendations();
  const insights = getInsights().slice(0, 4);

  const riskColor = {
    low: 'teal',
    moderate: 'accent',
    elevated: 'coral',
    high: 'coral',
  }[state.risk.level];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm text-muted-foreground mb-2">Financial Overview</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              {t('dashboard.headline')}
            </h1>
            <p className="text-muted-foreground">
              {customer.name} · {customer.location} · Updated today
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk score banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 p-4 sm:p-6 rounded border-l-4 ${
            state.risk.level === 'elevated' || state.risk.level === 'high'
              ? 'bg-coral/5 border-coral'
              : state.risk.level === 'moderate'
              ? 'bg-accent/5 border-accent'
              : 'bg-teal/5 border-teal'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 text-${riskColor}`} />
                <span className="text-sm font-medium">Financial Stress Signal</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                Your financial buffer has tightened over the last 8 weeks. Your current pattern suggests that
                building liquidity may be more valuable than taking on another large obligation.
              </p>
            </div>
            <div className={`px-3 py-1 rounded bg-${riskColor}/10 text-${riskColor} text-xs font-medium capitalize`}>
              {state.risk.level} risk
            </div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Financial State Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                Financial State
              </h3>
              <FinancialStateRadial state={state} />

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Income</span>
                  <span className="text-sm font-financial font-medium">{formatCurrency(state.income.monthly)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total EMIs</span>
                  <span className="text-sm font-financial font-medium text-coral">{formatCurrency(state.debt.existingEmi)}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Savings</span>
                  <span className="text-sm font-financial font-medium text-teal">{formatCurrency(state.savings.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">EMI Burden</span>
                  <span className={`text-sm font-financial font-medium ${state.debt.emiBurdenRatio > 35 ? 'text-coral' : 'text-foreground'}`}>
                    {state.debt.emiBurdenRatio}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Insights + What changed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buffer trend chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Buffer Trend
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last 5 months</p>
                </div>
                <div className="flex items-center gap-1.5 text-coral">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">-25%</span>
                </div>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BUFFER_DATA}>
                    <defs>
                      <linearGradient id="bufferGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D45555" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#D45555" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E4DE" />
                    <XAxis dataKey="month" stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} domain={[1.5, 4]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E4DE', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: any) => [`${value} months`, 'Buffer']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#D45555"
                      strokeWidth={2}
                      fill="url(#bufferGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* What changed */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded p-6"
            >
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {t('whatChanged.title')}
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Discretionary spending', change: '+11%', direction: 'up', severity: 'warning' as const, detail: 'Food & dining +18%, Shopping +8%' },
                  { label: 'Savings rate', change: '-8%', direction: 'down', severity: 'caution' as const, detail: 'Dropped from 30% to 22%' },
                  { label: 'Financial buffer', change: '-0.8mo', direction: 'down', severity: 'warning' as const, detail: 'From 3.2 months to 2.4 months' },
                  { label: 'EMI burden', change: 'stable', direction: 'stable', severity: 'info' as const, detail: '₹31,500/month (38.4% of income)' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <span className="text-sm font-medium">{item.label}</span>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      item.direction === 'up' ? 'text-coral' : item.direction === 'down' && item.severity === 'warning' ? 'text-coral' : 'text-muted-foreground'
                    }`}>
                      {item.direction === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {item.direction === 'down' && <ArrowDownRight className="w-3 h-3" />}
                      {item.direction === 'stable' && <Minus className="w-3 h-3" />}
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* What may matter next */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded p-6"
            >
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {t('whatMayMatter.title')}
              </h3>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-0.5">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.whyNow}</p>
                    </div>
                    {rec.cta && (
                      <Link
                        href={rec.ctaAction === 'build-buffer-plan' ? '/dashboard' : '/ask'}
                        className="ml-4 flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors whitespace-nowrap"
                      >
                        {rec.cta}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid sm:grid-cols-3 gap-4"
        >
          <Link
            href="/ask"
            className="group p-4 bg-card border border-border rounded hover:border-foreground/10 transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Ask ARTHDRISHTI</p>
              <p className="text-xs text-muted-foreground">Get personalized insights</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>

          <button
            onClick={() => setShowGovernance(true)}
            className="p-4 bg-card border border-border rounded hover:border-foreground/10 transition-all flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 bg-teal/10 rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Trust Layer</p>
              <p className="text-xs text-muted-foreground">Governance & safety</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <Link
            href="/financial-life"
            className="p-4 bg-card border border-border rounded hover:border-foreground/10 transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/5 rounded flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Financial Life</p>
              <p className="text-xs text-muted-foreground">Detailed analysis</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </motion.div>
      </div>

      {/* Governance Modal */}
      <AnimatePresence>
        {showGovernance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowGovernance(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-lg max-w-lg w-full p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-1">ARTHDRISHTI Trust Layer</h3>
              <p className="text-sm text-muted-foreground mb-6">AI proposes. Governance decides.</p>

              <div className="space-y-3">
                {[
                  { name: 'Consent Verified', status: 'passed' as const, detail: 'Customer has consented to financial analysis' },
                  { name: 'Suitability Check', status: 'caution' as const, detail: 'Multiple risk signals present' },
                  { name: 'Financial Stress Signal', status: 'caution' as const, detail: 'Buffer below threshold, cash flow declining' },
                  { name: 'Predatory Nudge Prevention', status: 'passed' as const, detail: 'System will not push unsuitable product' },
                  { name: 'Explainability', status: 'passed' as const, detail: 'Full reasoning trail available' },
                ].map((check, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{check.name}</p>
                      <p className="text-xs text-muted-foreground">{check.detail}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      check.status === 'passed'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowGovernance(false)}
                className="mt-6 w-full py-2.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
