'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarClock, ChevronRight, CircleGauge, ShieldAlert, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/format';
import { HealthScore, InsightRow, Lineage, MetricRail, NextBestAction, Trajectory, Trend } from '@/components/FinancialVisuals';

export default function DashboardPage() {
  const { demoState, t } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const { customer, financialState: state, insights } = demoState;
  const strong = state.healthBand === 'STRONG';
  return <div>
    <section className="surface-dark grid-rule noise">
      <div className="page-wrap relative z-10 grid min-h-[520px] items-center gap-10 py-12 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        <div>
          <div className="flex items-center gap-3"><span className={`status-dot ${strong ? 'status-positive' : 'status-caution'}`} /><p className="eyebrow !text-white/38">{t('dashboard.eyebrow')} · {t('common.updated')}</p></div>
          <motion.div key={state.healthScore} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mt-7 max-w-3xl text-[clamp(2.5rem,5vw,5.2rem)] font-medium leading-[.98] tracking-[-.06em]">{strong ? t('dashboard.strong') : t('dashboard.tightening')}</h1>
          </motion.div>
          <p className="mt-6 text-sm text-white/40">{customer.name} · {customer.location}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/financial-life" className="inline-flex items-center gap-3 bg-[#e88a34] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#10211d]">Open Financial DNA <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/ask" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-white/65">Ask about this</Link>
          </div>
        </div>
        <div className="grid items-center gap-6 sm:grid-cols-[280px_1fr] lg:justify-self-end">
          <HealthScore state={state} dark />
          <div className="space-y-5 border-l border-white/10 pl-6">
            {state.healthComponents.slice(0, 4).map(component => <div key={component.key}>
              <div className="flex items-center justify-between gap-6"><span className="text-xs text-white/45">{component.label}</span><span className="font-financial text-sm">{component.score}</span></div>
              <div className="mt-2 h-px bg-white/10"><motion.div key={component.score} className={`h-px ${component.score >= 80 ? 'bg-[#56a88d]' : component.score >= 55 ? 'bg-[#e88a34]' : 'bg-[#d46b61]'}`} initial={{ width: 0 }} animate={{ width: `${component.score}%` }} transition={{ duration: .8 }} /></div>
            </div>)}
            <Link href="/explain" className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#e88a34]">How the score is built <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </div>
    </section>
    <MetricRail state={state} />

    <section className="page-section">
      <div className="page-wrap grid gap-14 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow mb-3">What changed?</p><h2 className="text-3xl font-medium tracking-[-.045em]">The signals that matter now</h2></div><Link href="/insights" className="hidden text-xs font-bold uppercase tracking-wider md:block">All insights →</Link></div>
          <div className="mt-7 border-b hairline">
            {insights.slice(0, 4).map(insight => <InsightRow key={insight.id} insight={insight} onOpen={() => setSelected(selected === insight.id ? null : insight.id)} />)}
          </div>
          <AnimatePresence>{selected && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-6"><Lineage insight={insights.find(i => i.id === selected)!} state={demoState} /></motion.div>}</AnimatePresence>
        </div>
        <aside>
          <div className="border-t-2 border-[#e88a34] bg-[#e9e3d8] p-7">
            <div className="flex items-center justify-between"><p className="eyebrow">Current state</p><CircleGauge className="h-5 w-5 text-[#a46020]" /></div>
            <p className="mt-8 font-financial text-5xl">{formatINR(state.cashFlow.monthlySurplus)}</p><p className="mt-2 text-xs text-muted-foreground">monthly headroom after current outflows</p>
            <div className="mt-8 space-y-4 border-t hairline pt-5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Spending trend</span><Trend value={-state.spending.trend} /></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Savings trend</span><Trend value={state.savings.trend} /></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Risk band</span><b className="text-[#b84f49] capitalize">{state.risk.level}</b></div>
            </div>
          </div>
          <Link href="/cash-flow" className="group mt-4 flex items-start gap-4 border border-border bg-card p-5 transition hover:border-[#e88a34]"><CalendarClock className="mt-1 h-5 w-5 text-[#e88a34]" /><div><p className="text-sm font-semibold">{formatINR(state.cashFlow.upcomingObligations)} due in the next 10 days</p><p className="mt-2 text-xs leading-5 text-muted-foreground">See salary, EMIs, rent, utilities and recurring payments on the cash-flow timeline.</p></div><ArrowRight className="ml-auto h-4 w-4 transition group-hover:translate-x-1" /></Link>
          {demoState.protection.unresolvedCount > 0 && <Link href="/protection" className="mt-4 flex items-center gap-4 bg-[#b84f49] p-5 text-white"><ShieldAlert className="h-5 w-5" /><span className="text-sm font-semibold">A transaction needs verification</span><ArrowRight className="ml-auto h-4 w-4" /></Link>}
        </aside>
      </div>
    </section>

    <section className="page-wrap"><NextBestAction state={demoState} /></section>
    <section className="page-section"><div className="page-wrap surface p-6 md:p-10"><Trajectory data={demoState.trajectory} /></div></section>

    <section className="border-t hairline bg-[#e9e3d8] py-10">
      <div className="page-wrap flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="flex items-start gap-4"><Sparkles className="mt-1 h-5 w-5 text-[#e88a34]" /><div><p className="font-medium">The intelligence remains governed.</p><p className="mt-1 text-xs text-muted-foreground">Every consequential recommendation is traceable to data, model inputs and policy checks.</p></div></div><div className="flex gap-3"><Link href="/governance" className="border border-foreground/20 px-4 py-3 text-xs font-bold uppercase tracking-wider">Inspect governance</Link><Link href="/explain" className="bg-[#102b26] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white">See explanations</Link></div></div>
    </section>
  </div>;
}
