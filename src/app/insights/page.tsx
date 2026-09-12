'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getInsights } from '@/data/mock';
import type { Insight } from '@/types';

type FilterType = 'all' | 'warning' | 'caution' | 'positive' | 'neutral';

export default function InsightsPage() {
  const { language } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const insights = getInsights();

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.type === filter);

  const typeConfig = {
    warning: { bg: 'bg-coral/5', border: 'border-coral/20', text: 'text-coral', label: 'Warning' },
    caution: { bg: 'bg-accent/5', border: 'border-accent/20', text: 'text-accent', label: 'Caution' },
    positive: { bg: 'bg-teal/5', border: 'border-teal/20', text: 'text-teal', label: 'Positive' },
    neutral: { bg: 'bg-secondary', border: 'border-border', text: 'text-muted-foreground', label: 'Info' },
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-2">Transaction Intelligence</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Insights</h1>
            <p className="text-muted-foreground">
              Your transactions become signals. Here&apos;s what ARTHDRISHTI noticed.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-1 bg-secondary rounded p-0.5 w-fit mb-8">
          {(['all', 'warning', 'caution', 'positive', 'neutral'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm transition-colors capitalize ${
                filter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : typeConfig[f].label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredInsights.map((insight, i) => {
              const config = typeConfig[insight.type];
              const isExpanded = expandedId === insight.id;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${config.bg} border ${config.border} rounded p-5 cursor-pointer transition-all hover:shadow-sm`}
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {insight.type === 'warning' && <AlertTriangle className={`w-4 h-4 ${config.text}`} />}
                        {insight.type === 'positive' && <TrendingUp className={`w-4 h-4 ${config.text}`} />}
                        {insight.type === 'caution' && <Info className={`w-4 h-4 ${config.text}`} />}
                        <span className="text-sm font-medium">{insight.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Data Points</p>
                          <div className="space-y-1.5">
                            {insight.dataPoints.map((point, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                <span className="text-muted-foreground">{point}</span>
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

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded p-5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Active Signals</h3>
              <div className="space-y-3">
                {insights.slice(0, 4).map((insight, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.type}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      insight.type === 'warning' ? 'bg-coral' : insight.type === 'positive' ? 'bg-teal' : 'bg-accent'
                    }`} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded p-5">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">About Insights</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ARTHDRISHTI analyzes your transaction patterns to generate behavioral intelligence.
                Each insight is backed by specific data points from your financial history.
                Insights are generated by deterministic rules, not AI.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
