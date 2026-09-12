'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Globe2,
  Shield,
  Wallet,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  User,
  Phone,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'hinglish', label: 'Hinglish', native: 'हिंग्लिश' },
];

const GOALS = [
  { id: 'savings', icon: Wallet, label: 'Build savings', native: 'बचत बनाएं' },
  { id: 'debt', icon: TrendingUp, label: 'Manage debt', native: 'कर्ज प्रबंधन' },
  { id: 'purchase', icon: Target, label: 'Plan a major purchase', native: 'बड़ी खरीदारी की योजना' },
  { id: 'protection', icon: Shield, label: 'Protect my family', native: 'परिवार की सुरक्षा' },
  { id: 'understand', icon: Activity, label: 'Understand my finances', native: 'अपने वित्त समझें' },
  { id: 'invest', icon: TrendingUp, label: 'Grow investments', native: 'निवेश बढ़ाएं' },
];

export default function OnboardingPage() {
  const { language, setLanguage } = useApp();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [consents, setConsents] = useState({
    transactions: false,
    income: false,
    emi: false,
    savings: false,
  });

  const totalSteps = 5;

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return language !== null;
    if (step === 1) return phone.length >= 10;
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return consents.transactions;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${
                  i < step ? 'bg-primary' : 'bg-secondary'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Language */}
          {step === 0 && (
            <motion.div
              key="lang"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Globe2 className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Choose your language</h2>
                <p className="text-muted-foreground">Select your preferred language for the ARTHDRISHTI experience</p>
              </div>
              <div className="space-y-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'hi' | 'hinglish')}
                    className={`w-full p-4 rounded border text-left transition-all ${
                      language === lang.code
                        ? 'border-foreground bg-secondary'
                        : 'border-border hover:border-foreground/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lang.label}</p>
                        <p className="text-sm text-muted-foreground">{lang.native}</p>
                      </div>
                      {language === lang.code && <CheckCircle2 className="w-5 h-5 text-teal" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Phone */}
          {step === 1 && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Phone className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Verify your mobile number</h2>
                <p className="text-muted-foreground">We&apos;ll send you a one-time code to verify your identity</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-secondary border border-border rounded text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm outline-none focus:border-foreground/20 transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  By continuing, you agree to ARTHDRISHTI&apos;s terms of service and privacy policy.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">What would you like help with?</h2>
                <p className="text-muted-foreground">Select all that apply. This helps ARTHDRISHTI personalize your experience.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded border text-left transition-all ${
                      selectedGoals.includes(goal.id)
                        ? 'border-foreground bg-secondary'
                        : 'border-border hover:border-foreground/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <goal.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{goal.label}</p>
                        <p className="text-xs text-muted-foreground">{goal.native}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Consent */}
          {step === 3 && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-teal mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Data consent</h2>
                <p className="text-muted-foreground">Here is what ARTHDRISHTI will use and why.</p>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'transactions', label: 'Transaction History', desc: 'To understand your spending patterns', required: true },
                  { id: 'income', label: 'Income Patterns', desc: 'To assess stability and build models', required: true },
                  { id: 'emi', label: 'EMI & Debt Data', desc: 'To evaluate debt burden and suitability', required: true },
                  { id: 'savings', label: 'Savings Behavior', desc: 'To build personalized recommendations', required: false },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.required && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">Required</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setConsents(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                      disabled={item.required}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        consents[item.id as keyof typeof consents] ? 'bg-teal' : 'bg-secondary'
                      } ${item.required ? 'opacity-70' : ''}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        consents[item.id as keyof typeof consents] ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-teal" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">You&apos;re all set!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                ARTHDRISHTI will now analyze your financial life and provide personalized insights.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-3 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
              >
                Explore my financial life
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < totalSteps - 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
