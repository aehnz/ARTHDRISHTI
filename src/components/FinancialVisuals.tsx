'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Info, Shield, TrendingDown, TrendingUp } from 'lucide-react';
import type { DemoState, FinancialState, Insight, TrajectoryPoint } from '@/types';
import { formatINR } from '@/lib/format';

export function PageHeader({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description?: string; aside?: React.ReactNode }) {
  return <header className="border-b hairline bg-[#f8f5ee]">
    <div className="page-wrap grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <motion.div className="min-w-0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="section-title max-w-4xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>}
      </motion.div>
      {aside && <div className="min-w-0 lg:max-w-sm">{aside}</div>}
    </div>
  </header>;
}

export function HealthScore({ state, dark = false }: { state: FinancialState; dark?: boolean }) {
  const circumference = 2 * Math.PI * 72;
  const dash = (state.healthScore / 100) * circumference;
  const color = state.healthBand === 'STRONG' ? '#56a88d' : state.healthBand === 'STABLE' || state.healthBand === 'TIGHTENING' ? '#e88a34' : '#d46b61';
  return <div className="relative mx-auto aspect-square w-full max-w-[280px]">
    <svg viewBox="0 0 184 184" className="h-full w-full -rotate-90">
      <circle cx="92" cy="92" r="72" fill="none" stroke={dark ? 'rgba(255,255,255,.09)' : '#ded7ca'} strokeWidth="6" />
      <motion.circle cx="92" cy="92" r="72" fill="none" stroke={color} strokeWidth="7" strokeLinecap="butt" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - dash }} transition={{ duration: 1.1, ease: 'easeOut' }} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const x1 = Math.round((92 + Math.cos(a) * 79) * 1000) / 1000;
        const y1 = Math.round((92 + Math.sin(a) * 79) * 1000) / 1000;
        const x2 = Math.round((92 + Math.cos(a) * 84) * 1000) / 1000;
        const y2 = Math.round((92 + Math.sin(a) * 84) * 1000) / 1000;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dark ? 'rgba(255,255,255,.2)' : '#b8afa0'} strokeWidth="1" />;
      })}
    </svg>
    <div className="absolute inset-0 grid place-content-center text-center">
      <span className="metric-value !text-[4.3rem]">{state.healthScore}</span>
      <span className={`mt-1 text-[10px] font-bold uppercase tracking-[.18em] ${dark ? 'text-white/38' : 'text-muted-foreground'}`}>out of 100</span>
    </div>
  </div>;
}

export function MetricRail({ state }: { state: FinancialState }) {
  const metrics = [
    ['Monthly income', formatINR(state.income.monthly), state.income.stability],
    ['EMI burden', `${state.debt.emiBurdenRatio}%`, state.risk.contributingFactors?.find(item => item.toLowerCase().includes('emi')) ?? 'monitored'],
    ['Savings rate', `${state.savings.rate}%`, state.savings.trend >= 0 ? 'improving' : `${state.savings.trend}% trend`],
    ['Emergency buffer', `${state.savings.bufferMonths} mo`, state.healthComponents.find(item => item.key === 'liquidity')?.explanation ?? 'monitored'],
    ['Monthly headroom', formatINR(state.cashFlow.monthlySurplus), state.cashFlow.trend],
  ];
  return <div className="grid border-y hairline bg-[#f8f5ee] sm:grid-cols-2 lg:grid-cols-5">
    {metrics.map(([label, value, note], i) => <div key={label} className={`px-5 py-6 lg:px-6 ${i ? 'border-t hairline sm:border-l sm:border-t-0' : ''}`}>
      <p className="micro-label mb-3">{label}</p><p className="font-financial text-2xl font-medium">{value}</p>
      <p className={`mt-2 text-[11px] capitalize ${note.includes('attention') || note.includes('below') || note.includes('-') || note === 'declining' ? 'text-[#b84f49]' : 'text-muted-foreground'}`}>{note}</p>
    </div>)}
  </div>;
}

export function Trajectory({ data, compact = false }: { data: TrajectoryPoint[]; compact?: boolean }) {
  const width = 800, height = compact ? 210 : 280, pad = 36;
  const min = Math.min(...data.map(d => d.health)) - 8, max = Math.max(...data.map(d => d.health)) + 6;
  const points = data.map((d, i) => ({ ...d, x: pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1), y: pad + ((max - d.health) * (height - pad * 2)) / Math.max(1, max - min) }));
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const splitIndex = Math.max(0, data.findIndex(d => d.projected));
  return <div>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">Financial trajectory</p><h3 className="text-2xl font-medium tracking-[-.035em]">Past → today → what comes next</h3></div><p className="max-w-sm text-xs leading-5 text-muted-foreground">Projection assumes the recommended action is followed. It is an educational simulation, not a guarantee.</p></div>
    <div className="overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[680px]">
      {[0,1,2,3].map(i => <line key={i} x1={pad} x2={width-pad} y1={pad + i*((height-pad*2)/3)} y2={pad + i*((height-pad*2)/3)} stroke="#d8d0c2" strokeDasharray="2 8" />)}
      {splitIndex > 0 && <line x1={points[splitIndex].x - (points[1].x-points[0].x)/2} x2={points[splitIndex].x - (points[1].x-points[0].x)/2} y1={16} y2={height-22} stroke="#e88a34" strokeDasharray="4 6" />}
      <motion.path d={path} fill="none" stroke="#173d34" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} />
      {points.map((p) => <g key={p.label}><circle cx={p.x} cy={p.y} r="6" fill={p.projected ? '#e88a34' : '#173d34'} stroke="#f8f5ee" strokeWidth="3" /><text x={p.x} y={p.y-16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" fontWeight="600" fill="#10211d">{p.health}</text><text x={p.x} y={height-7} textAnchor="middle" fontSize="11" fill="#64716d">{p.label}</text></g>)}
    </svg></div>
    <div className="mt-3 flex gap-6 border-t hairline pt-4 text-xs text-muted-foreground"><span><b className="font-financial text-foreground">{data.at(-1)?.health}</b> projected health</span><span><b className="font-financial text-foreground">{data.at(-1)?.buffer} mo</b> projected buffer</span></div>
  </div>;
}

export function InsightRow({ insight, onOpen }: { insight: Insight; onOpen?: () => void }) {
  const tone = insight.type === 'positive' ? 'text-[#2d7a65]' : insight.type === 'warning' ? 'text-[#b84f49]' : 'text-[#a46020]';
  return <button onClick={onOpen} className="interactive-row grid w-full gap-3 border-t hairline px-1 py-5 text-left md:grid-cols-[150px_1fr_auto] md:items-center">
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] ${tone}`}><span className="status-dot" />{insight.category.replace('-', ' ')}</div>
    <div><h3 className="text-[15px] font-semibold tracking-[-.015em]">{insight.title}</h3><p className="mt-1 text-xs text-muted-foreground md:line-clamp-1">{insight.description}</p></div>
    <div className="flex items-center gap-4"><span className="font-financial text-sm">{insight.confidence}% confidence</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>
  </button>;
}

export function Lineage({ insight, state }: { insight: Insight; state: DemoState }) {
  const transactions = state.transactions.filter(t => insight.transactionIds.includes(t.id));
  return <div className="surface overflow-hidden">
    <div className="bg-[#102b26] px-6 py-7 text-[#fffaf0]"><p className="eyebrow !text-white/38">Why this insight exists</p><h3 className="mt-3 text-2xl font-medium tracking-[-.04em]">{insight.title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{insight.description}</p></div>
    <div className="grid gap-px bg-border md:grid-cols-3">
      <div className="bg-card p-5"><p className="micro-label">Signal</p><p className="mt-3 text-lg font-medium">{insight.dataPoints[0]}</p></div>
      <div className="bg-card p-5"><p className="micro-label">Supporting pattern</p><p className="mt-3 text-lg font-medium">{insight.dataPoints[1] ?? insight.impact}</p></div>
      <div className="bg-card p-5"><p className="micro-label">Evidence</p><p className="mt-3 text-lg font-medium">{transactions.length || insight.transactionIds.length} transactions</p></div>
    </div>
    {transactions.slice(0, 5).map(t => <div key={t.id} className="flex flex-col items-start gap-2 border-t hairline px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><div><span className="font-medium">{t.merchant}</span><span className="ml-3 text-xs text-muted-foreground">{t.date}</span></div><span className="font-financial">{formatINR(t.amount)}</span></div>)}
    <div className="flex flex-col items-start gap-3 border-t hairline bg-[#f4f0e8] px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{insight.impact}</p><Link href="/transactions" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">View all data <ArrowRight className="h-3.5 w-3.5" /></Link></div>
  </div>;
}

export function NextBestAction({ state }: { state: DemoState }) {
  const action = state.recommendations[0];
  const recovery = action.ctaAction;
  return <section className="surface-dark grid-rule overflow-hidden">
    <div className="grid lg:grid-cols-[.8fr_1.2fr]">
      <div className="border-b border-white/10 p-7 lg:border-b-0 lg:border-r lg:p-10">
        <p className="eyebrow !text-[#e88a34]">Next best action</p>
        <h2 className="mt-5 text-3xl font-medium leading-[1.03] tracking-[-.05em] md:text-5xl">{action.title}</h2>
        <p className="mt-5 max-w-lg text-sm leading-6 text-white/55">{action.description}</p>
        <Link href={recovery} className="mt-8 inline-flex items-center gap-3 bg-[#e88a34] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#10211d]">{action.cta}<ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid sm:grid-cols-3">
        {[['Why now?', action.whyNow], ['If you act', action.ifYouAct], ["If you don't", action.ifYouDont]].map(([label, value], i) => <div key={label} className={`p-6 lg:p-8 ${i ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}><p className="micro-label !text-white/30">{label}</p><p className="mt-5 text-sm leading-6 text-white/68">{value}</p>{i === 1 && <p className="mt-6 font-financial text-2xl text-[#f19a49]">{action.expectedImpact}</p>}</div>)}
      </div>
    </div>
  </section>;
}

export function DecisionMark({ decision }: { decision: string }) {
  const good = decision === 'RECOMMENDED';
  return <div className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] ${good ? 'border-[#2d7a65]/30 bg-[#2d7a65]/10 text-[#2d7a65]' : 'border-[#b84f49]/30 bg-[#b84f49]/10 text-[#b84f49]'}`}>{good ? <Check className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}{decision.replaceAll('_', ' ')}</div>;
}

export function Trend({ value }: { value: number }) {
  return <span className={`flex items-center gap-1 text-xs ${value >= 0 ? 'text-[#2d7a65]' : 'text-[#b84f49]'}`}>{value >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{value > 0 ? '+' : ''}{value}%</span>;
}

export function PrototypeNote() {
  return <div className="flex gap-3 border-l-2 border-[#e88a34] bg-[#e88a34]/7 p-4 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#a46020]" /><p>Affordability results are illustrative and educational. Actual lending decisions require bureau data, underwriting, lender policy and regulatory checks.</p></div>;
}
