'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getPotentialAnomaly } from '@/data/mock';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function ProtectionPage() {
  const { language } = useApp();
  const [showAnomaly, setShowAnomaly] = useState(false);
  const [anomalyResolved, setAnomalyResolved] = useState<'yes' | 'no' | null>(null);

  const anomaly = getPotentialAnomaly();

  const resetAnomaly = () => {
    setShowAnomaly(false);
    setAnomalyResolved(null);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-teal" />
              <p className="text-sm text-muted-foreground">Fraud & Anomaly Detection</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Protection</h1>
            <p className="text-muted-foreground">ARTHDRISHTI monitors your transactions and alerts you to potentially unusual activity.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="bg-card border border-border rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Monitoring</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal rounded-full animate-pulse-subtle" />
                  <span className="text-xs text-teal font-medium">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Transaction Pattern Analysis', status: 'active', desc: 'Learning your usual patterns' },
                  { name: 'Amount Threshold Monitoring', status: 'active', desc: 'Unusual amounts flagged' },
                  { name: 'Time & Location Checks', status: 'active', desc: 'Anomaly detection enabled' },
                  { name: 'Merchant Pattern Matching', status: 'active', desc: 'New merchant identification' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal" />
                      <span className="text-xs text-teal capitalize">{feature.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2.5 border border-border rounded text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Run fresh scan
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="bg-teal/5 border border-teal/20 rounded p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-teal" />
                <span className="text-sm font-medium">Protection Status</span>
              </div>
              <p className="text-xs text-muted-foreground">No confirmed threats detected. Monitoring your transactions continuously.</p>
            </div>

            <div className="bg-card border border-border rounded p-5">
              <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => { setShowAnomaly(true); setAnomalyResolved(null); }} className="w-full py-2 px-3 text-sm text-left hover:bg-secondary rounded transition-colors flex items-center justify-between group">
                  <span>View flagged transaction</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <button className="w-full py-2 px-3 text-sm text-left hover:bg-secondary rounded transition-colors flex items-center justify-between group">
                  <span>Report a concern</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showAnomaly && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-card border border-accent/20 rounded-lg overflow-hidden">
              {!anomalyResolved ? (
                <div>
                  <div className="bg-accent/5 p-5 border-b border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold">Potentially Unusual Activity</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">We noticed a transaction that doesn&apos;t match your usual pattern. This doesn&apos;t necessarily mean it&apos;s fraudulent.</p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="bg-secondary/30 rounded p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-2xl font-semibold font-financial">{formatCurrency(anomaly.amount)}</p>
                          <p className="text-sm text-muted-foreground mt-1">Online Transaction</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{anomaly.time}</p>
                          <p className="text-xs text-muted-foreground">{anomaly.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>{anomaly.merchant} · {anomaly.location}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">Why was this flagged?</h4>
                      <div className="space-y-2">
                        {anomaly.reasons.map((reason, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setAnomalyResolved('yes')} className="flex-1 py-2.5 bg-teal text-white rounded text-sm font-medium hover:bg-teal/90 transition-colors">Yes, this was me</button>
                      <button onClick={() => setAnomalyResolved('no')} className="flex-1 py-2.5 bg-coral text-white rounded text-sm font-medium hover:bg-coral/90 transition-colors">No, I don&apos;t recognize this</button>
                      <button onClick={() => setAnomalyResolved('no')} className="py-2.5 px-4 border border-border rounded text-sm font-medium hover:bg-secondary transition-colors">Not sure</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {anomalyResolved === 'yes' ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-teal" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Transaction Verified</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">Thank you for confirming. We&apos;ve marked this transaction as legitimate. We&apos;ll learn from this to reduce future false alerts.</p>
                      <button onClick={resetAnomaly} className="px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">Close</button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-coral" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">We&apos;re on it</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">We&apos;ve flagged this transaction for review. Here&apos;s what happens next:</p>
                      <div className="bg-secondary/30 rounded p-4 max-w-md mx-auto text-left space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-accent" />
                          <span>Card will be temporarily blocked for new transactions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-teal" />
                          <span>Our team will review within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          <span>You&apos;ll receive updates via SMS</span>
                        </div>
                      </div>
                      <button onClick={resetAnomaly} className="px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">Close</button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
