'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Eye, Heart, ArrowDown, Sparkles, CheckCircle2, Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function LandingPage() {
  const { setDemoScenario, setIsDemoMode } = useApp();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleExplore = () => {
    setIsDemoMode(true);
    setDemoScenario('tightening');
    window.location.href = '/dashboard';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Subtle background elements */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(232,168,56,0.08) 0%, transparent 50%)`,
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                Financial Intelligence for Bharat
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1 variants={itemVariants} className="mb-6">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95]">
              ARTHDRISHTI
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p variants={itemVariants} className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            Your bank sees transactions.
            <br />
            <span className="text-foreground font-medium">ARTHDRISHTI sees financial life.</span>
          </motion.p>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-base text-muted-foreground/80 mb-10 max-w-xl mx-auto leading-relaxed">
            An intelligent banking layer that understands financial behavior,
            explains what matters, protects customers from financial stress,
            and recommends what is genuinely useful.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleExplore}
              className="group relative px-8 py-3.5 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-all hover:gap-3 flex items-center gap-2 shadow-lg shadow-primary/10"
            >
              Explore my financial life
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-secondary text-secondary-foreground rounded font-medium text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              See how it works
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal" />
              <span>Responsible AI</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span>Explainable decisions</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-coral" />
              <span>Vernacular-first</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight">
              Good banking doesn&apos;t always say yes.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sometimes the most useful financial recommendation is no.
              ARTHDRISHTI protects customers from financial stress
              rather than pushing unsuitable products.
            </p>
          </motion.div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                color: 'accent',
                title: 'Understands',
                description: 'Reads transaction patterns, income stability, spending behavior, and financial health signals.',
              },
              {
                icon: Shield,
                color: 'teal',
                title: 'Protects',
                description: 'Detects financial stress, evaluates loan suitability, and says no when it matters most.',
              },
              {
                icon: Heart,
                color: 'coral',
                title: 'Explains',
                description: 'Every decision comes with clear reasoning. Customers understand why, not just what.',
              },
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group p-6 bg-card border border-border rounded hover:border-foreground/10 transition-colors"
              >
                <div className={`w-10 h-10 bg-${pillar.color}/10 rounded flex items-center justify-center mb-4`}>
                  <pillar.icon className={`w-5 h-5 text-${pillar.color}`} />
                </div>
                <h3 className="text-lg font-medium mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              How ARTHDRISHTI works
            </h2>
            <p className="text-muted-foreground">
              From raw transactions to responsible intelligence
            </p>
          </motion.div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Customer Data', desc: 'Transactions, income, savings, EMI patterns — all from your existing bank data.' },
              { step: '02', title: 'Transaction Intelligence', desc: 'Raw activity becomes behavioral signals. Patterns emerge that numbers alone cannot show.' },
              { step: '03', title: 'Financial State', desc: 'A living model of your financial health — income, spending, debt, savings, buffer, and risk.' },
              { step: '04', title: 'Governance & Safety', desc: 'Deterministic rules evaluate suitability. The AI explains. Governance decides.' },
              { step: '05', title: 'Personalized Action', desc: 'Recommendations based on your actual context. Including the courage to say no.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 py-8 border-b border-border/50 last:border-0"
              >
                <span className="text-xs font-mono text-muted-foreground mt-1 w-8">{item.step}</span>
                <div>
                  <h3 className="text-lg font-medium mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Experience ARTHDRISHTI
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Meet Ravi Sharma, a 32-year-old professional from Ahmedabad.
              See how ARTHDRISHTI understands his financial life — and makes a responsible recommendation.
            </p>
            <button
              onClick={handleExplore}
              className="group px-8 py-3.5 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-all hover:gap-3 flex items-center gap-2 mx-auto shadow-lg shadow-primary/10"
            >
              Explore my financial life
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-sm font-medium">ARTHDRISHTI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>pizza</span>
            <span className="text-border">·</span>
            <span>HackOut&apos;26</span>
            <span className="text-border">·</span>
            <span>Financial Intelligence for Bharat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
