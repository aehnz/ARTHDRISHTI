'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { evaluateLoanSuitability } from '@/data/mock';

export default function LoanDecisionPage() {
  const { language } = useApp();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [tenure, setTenure] = useState(36);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [assessment, setAssessment] = useState<ReturnType<typeof evaluateLoanSuitability> | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResult(false);

    await new Promise(r => setTimeout(r, 600));
    await new Promise(r => setTimeout(r, 500));
    await new Promise(r => setTimeout(r, 400));
    await new Promise(r => setTimeout(r, 300));

    const result = evaluateLoanSuitability(amount!, tenure);
    setAssessment(result);
    setIsAnalyzing(false);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-2">Loan Decision Journey</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Responsible Loan Assessment</h1>
            <p className="text-muted-foreground">See how ARTHDRISHTI evaluates whether a loan is suitable for your financial situation.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded p-6 mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Your Financial Context</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
              <p className="text-lg font-financial font-medium">₹82,000</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Existing EMI</p>
              <p className="text-lg font-financial font-medium text-coral">₹31,500</p>
              <p className="text-xs text-muted-foreground">38.4% of income</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Savings</p>
              <p className="text-lg font-financial font-medium text-teal">₹1.82L</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Buffer</p>
              <p className="text-lg font-financial font-medium text-coral">2.4 months</p>
            </div>
          </div>
        </motion.div>

        {!isAnalyzing && !showResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded p-6 mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Loan Parameters</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Loan Amount: ₹{(amount! / 100000).toFixed(1)}L</label>
                <input type="range" min={100000} max={2000000} step={50000} value={amount!}
                  onChange={(e) => setAmount(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">₹1L</span>
                  <span className="text-xs text-muted-foreground">₹20L</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tenure: {tenure / 12} years</label>
                <input type="range" min={12} max={84} step={12} value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">1 yr</span>
                  <span className="text-xs text-muted-foreground">7 yrs</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary/30 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Monthly EMI</p>
                  <p className="text-2xl font-financial font-semibold">
                    ₹{Math.round((amount! * 0.011 * Math.pow(1.011, tenure)) / (Math.pow(1.011, tenure) - 1)).toLocaleString('en-IN')}
                  </p>
                </div>
                <button onClick={handleAnalyze} className="px-6 py-2.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                  Analyze Suitability
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <h3 className="font-medium">ARTHDRISHTI is analyzing your request...</h3>
            </div>
            <div className="space-y-3">
              {['Reading your financial context', 'Checking recent patterns', 'Evaluating affordability', 'Running suitability checks', 'Preparing explanation'].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-accent' : 'bg-secondary'}`}>
                    {i <= 1 ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />}
                  </div>
                  <span className={`text-sm ${i <= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showResult && assessment && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-coral/5 border border-coral/20 rounded-lg overflow-hidden mb-8">
              <div className="bg-coral/5 p-6 border-b border-coral/20">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-coral" />
                  <span className="text-sm font-medium">ARTHDRISHTI&apos;s Assessment</span>
                </div>
                <p className="text-3xl font-semibold text-coral tracking-tight mb-2">{assessment.governance.decision}</p>
                <p className="text-sm text-muted-foreground max-w-xl">Right now, a new ₹{(amount! / 100000).toFixed(0)}L loan may put unnecessary pressure on your monthly cash flow.</p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-medium mb-3">Your Current Situation</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-secondary/30 rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Existing EMI</p>
                      <p className="text-sm font-financial font-medium">₹31,500/mo</p>
                      <p className="text-xs text-muted-foreground">38.4% of income</p>
                    </div>
                    <div className="bg-secondary/30 rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Financial Buffer</p>
                      <p className="text-sm font-financial font-medium text-coral">2.4 months</p>
                      <p className="text-xs text-muted-foreground">Below 3-month threshold</p>
                    </div>
                    <div className="bg-secondary/30 rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Cash Flow Trend</p>
                      <p className="text-sm font-financial font-medium text-coral">Declining</p>
                      <p className="text-xs text-muted-foreground">Last 6 weeks</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">If you take a ₹{(amount! / 100000).toFixed(0)}L loan ({tenure / 12} years)</h4>
                  <div className="bg-coral/5 border border-coral/20 rounded p-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">New Monthly EMI</p>
                        <p className="text-xl font-financial font-semibold">₹{assessment.monthlyEmi.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total EMI Burden After</p>
                        <p className="text-xl font-financial font-semibold text-coral">{Math.round(assessment.affordabilityRatio)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Governance Check</h4>
                  <div className="bg-secondary/30 rounded p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {assessment.governance.checks.slice(0, 6).map((check, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {check.status === 'passed' ? <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" /> :
                           check.status === 'caution' ? <ShieldAlert className="w-4 h-4 text-accent flex-shrink-0" /> :
                           <XCircle className="w-4 h-4 text-coral flex-shrink-0" />}
                          <span className="text-xs text-muted-foreground">{check.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-teal" />
                      <span className="text-xs text-muted-foreground">AI proposes. Governance decides.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Why ARTHDRISHTI says no</h4>
                  <div className="space-y-2">
                    {assessment.reasoning.slice(0, 5).map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-coral rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-teal/5 border border-teal/20 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-teal" />
                    <span className="text-sm font-medium text-teal">Better Next Step</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Let&apos;s build your 90-day financial buffer first. This will strengthen your position for future financial decisions.</p>
                  <button onClick={() => { setShowResult(false); setAssessment(null); }}
                    className="w-full py-2.5 bg-teal text-white rounded text-sm font-medium hover:bg-teal/90 transition-colors">
                    Build my 90-day plan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showResult && (
          <div className="text-center">
            <button onClick={() => { setShowResult(false); setAssessment(null); setAmount; setTenure(36); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Try a different loan scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
