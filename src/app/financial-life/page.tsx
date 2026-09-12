'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { getFinancialState, getSignals, getCustomer } from '@/data/mock';
import type { FinancialState } from '@/types';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const SPENDING_BREAKDOWN = [
  { category: 'Housing', amount: 18000, color: '#1A1F36' },
  { category: 'Food', amount: 14200, color: '#E8A838' },
  { category: 'EMIs', amount: 31500, color: '#D45555' },
  { category: 'Mobility', amount: 4800, color: '#4A9B8E' },
  { category: 'Shopping', amount: 8900, color: '#8B7BB5' },
  { category: 'Subscriptions', amount: 2816, color: '#6B6F80' },
  { category: 'Utilities', amount: 3400, color: '#A0A0B0' },
  { category: 'UPI/Other', amount: 5200, color: '#C0C0CC' },
];

const MONTHLY_FLOW = [
  { month: 'Apr', income: 82000, committed: 52300, discretionary: 28000 },
  { month: 'May', income: 82000, committed: 52300, discretionary: 31000 },
  { month: 'Jun', income: 82000, committed: 52300, discretionary: 32500 },
  { month: 'Jul', income: 82000, committed: 52300, discretionary: 34000 },
  { month: 'Aug', income: 82000, committed: 52300, discretionary: 36000 },
  { month: 'Sep', income: 82000, committed: 52300, discretionary: 37800 },
];

const FINANCIAL_STATE_LAYERS = [
  {
    id: 'income',
    label: 'Income',
    amount: 82000,
    color: '#1A1F36',
    icon: TrendingUp,
    description: 'Stable monthly income from TechCorp India Pvt Ltd. Consistent for 12 months.',
    details: {
      'Monthly Income': '₹82,000',
      'Annual Income': '₹9,84,000',
      'Stability': 'Consistent (12 months)',
      'Employer': 'TechCorp India Pvt Ltd',
      'Variability': 'None detected',
    },
  },
  {
    id: 'essential',
    label: 'Essential Spending',
    amount: 41800,
    color: '#4A9B8E',
    icon: Wallet,
    description: 'Core monthly expenses including housing, utilities, food, and mobility.',
    details: {
      'Total Essential': '₹41,800/month',
      'Housing': '₹18,000 (Rent)',
      'Utilities': '₹4,600 (Electricity + Internet)',
      'Food': '₹14,200 (Groceries + essentials)',
      'Mobility': '₹4,800 (Transport)',
      'Percentage of income': '51%',
    },
  },
  {
    id: 'emi',
    label: 'EMIs & Commitments',
    amount: 31500,
    color: '#E8A838',
    icon: CreditCard,
    description: 'Three active EMIs: car loan, personal loan, and credit card.',
    details: {
      'Car Loan (HDFC)': '₹12,500/month',
      'Personal Loan (ICICI)': '₹9,500/month',
      'Credit Card (SBI)': '₹3,500/month',
      'Total EMI': '₹25,500/month',
      'Other bills': '₹6,000/month',
      'EMI burden': '38.4% of income',
      'Active accounts': '3',
    },
  },
  {
    id: 'discretionary',
    label: 'Discretionary Spending',
    amount: 34200,
    color: '#D45555',
    icon: Zap,
    description: 'Non-essential spending that has increased 11% over the last 30 days.',
    details: {
      'Food & Dining': '₹8,400/month (+18%)',
      'Shopping': '₹5,600/month (+8%)',
      'Subscriptions': '₹2,816/month',
      'UPI micro-spending': '₹4,200/month (+12%)',
      'Healthcare': '₹400/month',
      'Travel': '₹0',
      'Total discretionary': '₹34,200/month',
    },
  },
  {
    id: 'savings',
    label: 'Savings',
    amount: 182000,
    color: '#8B7BB5',
    icon: PiggyBank,
    description: 'Total savings of ₹1.82L with a declining savings rate of 22%.',
    details: {
      'Total Savings': '₹1,82,000',
      'Monthly savings': '~₹18,000',
      'Savings rate': '22% (down from 30%)',
      'Buffer': '2.4 months of essential expenses',
      'Buffer 8 weeks ago': '3.2 months',
      'Savings vehicle': 'RD Account',
    },
  },
];

export default function FinancialLifePage() {
  const { language } = useApp();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'breakdown'>('flow');

  const state = getFinancialState();
  const signals = getSignals();
  const customer = getCustomer();

  const selectedLayerData = FINANCIAL_STATE_LAYERS.find(l => l.id === selectedLayer);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-2">Complete Financial Picture</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Your Financial Life
            </h1>
            <p className="text-muted-foreground">
              {customer.name} · {customer.location} · All data from your banking relationship
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded p-0.5 w-fit mb-8">
          <button
            onClick={() => setViewMode('flow')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'flow'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cash Flow
          </button>
          <button
            onClick={() => setViewMode('breakdown')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              viewMode === 'breakdown'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Spending Breakdown
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded p-6">
              {viewMode === 'flow' ? (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Monthly Cash Flow
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MONTHLY_FLOW}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4DE" />
                        <XAxis dataKey="month" stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E4DE', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Bar dataKey="income" fill="#4A9B8E" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="committed" fill="#E8A838" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="discretionary" fill="#D45555" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal rounded-sm" /> Income</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-accent rounded-sm" /> Committed (EMI + Essentials)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-coral rounded-sm" /> Discretionary</div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Monthly Spending Breakdown
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SPENDING_BREAKDOWN} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4DE" />
                        <XAxis type="number" stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis dataKey="category" type="category" stroke="#6B6F80" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E4DE', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value: any) => [formatCurrency(value), 'Amount']}
                        />
                        <Bar dataKey="amount" radius={[0, 3, 3, 0]}>
                          {SPENDING_BREAKDOWN.map((entry) => (
                            <rect key={entry.category} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: Layer selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {FINANCIAL_STATE_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                className={`w-full p-4 rounded border text-left transition-all ${
                  selectedLayer === layer.id
                    ? 'border-foreground/20 bg-secondary'
                    : 'border-border hover:border-foreground/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${layer.color}15` }}>
                    <layer.icon className="w-4 h-4" style={{ color: layer.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{layer.label}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(layer.amount)}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedLayer === layer.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
            ))}

            {/* Financial health score */}
            <div className="bg-card border border-border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Financial Health Score</span>
                <span className={`text-lg font-semibold font-financial ${
                  state.risk.score > 60 ? 'text-coral' : state.risk.score > 35 ? 'text-accent' : 'text-teal'
                }`}>
                  {100 - state.risk.score}/100
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - state.risk.score}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-full rounded-full ${
                    state.risk.score > 60 ? 'bg-coral' : state.risk.score > 35 ? 'bg-accent' : 'bg-teal'
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {state.risk.level === 'elevated' ? 'Your financial health needs attention' : state.risk.level === 'moderate' ? 'Room for improvement' : 'Looking good'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Layer detail panel */}
        <AnimatePresence>
          {selectedLayerData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-card border border-border rounded p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: `${selectedLayerData.color}15` }}>
                    <selectedLayerData.icon className="w-5 h-5" style={{ color: selectedLayerData.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedLayerData.label}</h3>
                    <p className="text-sm text-muted-foreground">{formatCurrency(selectedLayerData.amount)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLayer(null)}
                  className="p-1.5 hover:bg-secondary rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{selectedLayerData.description}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(selectedLayerData.details).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded">
                    <span className="text-xs text-muted-foreground">{key}</span>
                    <span className="text-xs font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
