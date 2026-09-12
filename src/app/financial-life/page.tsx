'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, CreditCard, ShieldCheck } from 'lucide-react';
import { HealthScore, PageHeader, Trend } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/data/intelligence';

export default function FinancialLifePage() {
  const { demoState } = useApp();
  const { customer, financialState: s } = demoState;
  const dimensions = [
    ['Income',[['Monthly',formatINR(s.income.monthly)],['Stability',s.income.stability],['Volatility',`${s.income.volatility}%`],['Trend',s.cashFlow.trend]]],
    ['Spending',[['Essential',formatINR(s.spending.essential)],['Discretionary',formatINR(s.spending.discretionary)],['Trend',`${s.spending.trend>0?'+':''}${s.spending.trend}%`],['Potential leak',formatINR(s.spending.potentialLeaks)]]],
    ['Debt',[['EMI burden',`${s.debt.emiBurdenRatio}%`],['Active obligations',String(s.debt.accounts)],['Outstanding',formatINR(s.debt.totalOutstanding,true)],['Utilization',`${s.debt.utilization}%`]]],
    ['Savings',[['Available',formatINR(s.savings.total)],['Savings rate',`${s.savings.rate}%`],['Buffer',`${s.savings.bufferMonths} months`],['Monthly',formatINR(s.savings.monthlyContribution)]]],
    ['Behaviour',[['Pattern',s.spending.trend>8?'Changing':'Consistent'],['Recurring rhythm',s.savings.trend<0?'Delayed':'On schedule'],['Spending signal',s.spending.trend>0?'Rising':'Controlled'],['Transaction confidence','94%']]],
    ['Risk',[['Liquidity',s.savings.bufferMonths<3?'Needs attention':'Resilient'],['Repayment',s.debt.emiBurdenRatio>45?'High pressure':'On schedule'],['Cash-flow stress',s.risk.level],['Anomaly',demoState.scenario==='anomaly'?'Active':'None']]],
    ['Opportunity',[['Monthly leaks',formatINR(s.spending.potentialLeaks)],['Goal headroom',formatINR(Math.max(0,s.cashFlow.monthlySurplus))],['Buffer gap',s.savings.bufferMonths<3?`${(3-s.savings.bufferMonths).toFixed(1)} months`:'Target met'],['Priority',s.healthScore>80?'Accelerate':'Build resilience']]],
  ];
  return <div>
    <PageHeader eyebrow="Money · Customer 360" title="Financial DNA" description={`The intelligence layer beneath every decision for ${customer.name}: income, spending, debt, savings, behaviour, risk and opportunity.`} aside={<div className="text-right"><p className="font-financial text-4xl">{s.healthScore}<span className="text-base text-muted-foreground">/100</span></p><p className="micro-label mt-2">financial health</p></div>} />
    <section className="page-wrap grid gap-6 py-8 lg:grid-cols-[.72fr_1.28fr]">
      <div className="surface-dark grid-rule p-7 md:p-9">
        <p className="eyebrow !text-white/35">Composite financial state</p><HealthScore state={s} dark />
        <div className="mt-5 border-t border-white/10 pt-6"><p className="text-sm leading-6 text-white/52">{s.healthScore>=80?'Strong liquidity, disciplined savings and manageable debt create flexibility.':'Stable income is helping, but debt load and a thinner buffer are constraining resilience.'}</p></div>
      </div>
      <div className="surface">
        <div className="border-b hairline p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Health score anatomy</p><h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">Nothing arbitrary. Every point has a source.</h2></div><BrainCircuit className="h-6 w-6 text-[#e88a34]"/></div></div>
        {s.healthComponents.map(c=><div key={c.key} className="grid gap-4 border-b last:border-b-0 hairline p-5 md:grid-cols-[160px_1fr_50px] md:items-center"><div><p className="text-sm font-semibold">{c.label}</p><div className="mt-2"><Trend value={c.trend}/></div></div><div><div className="h-1.5 bg-secondary"><motion.div className={`h-full ${c.score>=80?'bg-[#2d7a65]':c.score>=55?'bg-[#e88a34]':'bg-[#b84f49]'}`} initial={{width:0}} whileInView={{width:`${c.score}%`}} viewport={{once:true}}/></div><p className="mt-2 text-[11px] leading-4 text-muted-foreground">{c.explanation}</p></div><p className="font-financial text-right text-xl">{c.score}</p></div>)}
      </div>
    </section>

    <section className="page-section pt-10"><div className="page-wrap">
      <div className="mb-8 flex items-end justify-between"><div><p className="eyebrow">Seven dimensions</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">A connected view of financial life</h2></div><Link href="/explain" className="hidden text-xs font-bold uppercase tracking-wider md:block">Trace the model →</Link></div>
      <div className="grid gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
        {dimensions.map(([title,items],i)=><article key={String(title)} className={`bg-card p-6 md:p-7 ${i===6?'xl:col-span-3':''}`}><p className="eyebrow">{title as string}</p><dl className={`mt-6 grid ${i===6?'sm:grid-cols-4 gap-4':'grid-cols-2 gap-px bg-border border border-border'}`}>{(items as string[][]).map(([a,b])=><div key={a} className={i===6?'border-l-2 border-[#e88a34] bg-[#f3efe7] p-4':'bg-card p-4'}><dt className="micro-label">{a}</dt><dd className="mt-3 text-sm font-semibold capitalize">{b}</dd></div>)}</dl></article>)}
      </div>
    </div></section>

    <section className="bg-[#102b26] py-14 text-[#fffaf0]"><div className="page-wrap grid gap-8 lg:grid-cols-2">
      <div className="border border-white/10 p-7 md:p-9"><div className="flex items-center justify-between"><div><p className="eyebrow !text-white/30">Credit health index</p><p className={`mt-5 text-3xl font-medium ${s.creditHealth.index==='STRONG'?'text-[#75bca5]':'text-[#f0a45c]'}`}>{s.creditHealth.index}</p></div><CreditCard className="h-7 w-7 text-white/25"/></div><p className="font-financial mt-7 text-6xl">{s.creditHealth.score}<span className="text-xl text-white/30">/100</span></p><div className="mt-8 space-y-3 border-t border-white/10 pt-5">{s.creditHealth.factors.map(f=><p key={f} className="flex items-center gap-3 text-xs text-white/48"><span className="h-1 w-1 bg-[#e88a34]"/>{f}</p>)}</div><p className="mt-6 text-[10px] leading-4 text-white/28">An ARTHDRISHTI behavioural index. This is not a CIBIL score or lender underwriting result.</p></div>
      <div className="border border-white/10 p-7 md:p-9"><div className="flex items-center justify-between"><div><p className="eyebrow !text-white/30">Model inference</p><p className="mt-5 text-3xl font-medium">{demoState.modelInference.band}</p></div><ShieldCheck className="h-7 w-7 text-[#e88a34]"/></div><div className="mt-8 space-y-4">{demoState.modelInference.contributions.map(c=><div key={c.feature} className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/10 pb-3 text-xs"><span className="text-white/50">{c.feature}</span><span className="font-financial">{c.value}</span><span className={`font-financial ${c.impact>0?'text-[#75bca5]':'text-[#e98a7e]'}`}>{c.impact>0?'+':''}{c.impact}</span></div>)}</div><Link href="/explain" className="mt-8 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#e88a34]">Inspect full trace <ArrowRight className="h-4 w-4"/></Link></div>
    </div></section>
  </div>;
}
