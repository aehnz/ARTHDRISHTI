'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader, PrototypeNote, Trajectory } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR, simulateWhatIf } from '@/data/intelligence';

export default function WhatIfPage() {
  const { demoState } = useApp();
  const [saving, setSaving] = useState(5000);
  const [income, setIncome] = useState(0);
  const [emi, setEmi] = useState(0);
  const result = useMemo(()=>simulateWhatIf(demoState,saving,income,emi),[demoState,saving,income,emi]);
  const good = result.direction === 'BETTER', bad = result.direction === 'WORSE';
  const comparison = [
    ['Financial health',demoState.financialState.healthScore,result.health,'/100'],
    ['Emergency buffer',demoState.financialState.savings.bufferMonths,result.buffer,' months'],
    ['Monthly headroom',demoState.financialState.cashFlow.monthlySurplus,result.monthlySurplus,'₹'],
    ['EMI burden',demoState.financialState.debt.emiBurdenRatio,result.emiBurden,'%'],
  ];
  const trajectory = [
    {label:'Today',health:demoState.financialState.healthScore,buffer:demoState.financialState.savings.bufferMonths,cashFlow:demoState.financialState.cashFlow.monthlySurplus},
    {label:'3 months',health:Math.round((demoState.financialState.healthScore+result.health)/2),buffer:Number(((demoState.financialState.savings.bufferMonths+result.buffer)/2).toFixed(1)),cashFlow:Math.round((demoState.financialState.cashFlow.monthlySurplus+result.monthlySurplus)/2),projected:true},
    {label:'12 months',health:result.health,buffer:result.buffer,cashFlow:result.monthlySurplus,projected:true},
  ];
  return <div>
    <PageHeader eyebrow="Decisions · What-if engine" title="Explore the future before committing to it." description="Change income, saving and debt assumptions. Every dependent financial metric recalculates from the same canonical state." aside={<div className={`flex items-center gap-3 border px-4 py-3 text-xs font-bold tracking-[.16em] ${good?'border-[#2d7a65]/30 bg-[#2d7a65]/10 text-[#2d7a65]':bad?'border-[#b84f49]/30 bg-[#b84f49]/10 text-[#b84f49]':'border-border'}`}>{good?<TrendingUp/>:bad?<TrendingDown/>:<Minus/>}{result.direction}</div>} />
    <div className="page-wrap grid gap-6 py-8 lg:grid-cols-[.7fr_1.3fr]">
      <aside className="surface h-fit p-6 lg:sticky lg:top-24 md:p-8">
        <p className="eyebrow">Scenario assumptions</p>
        <div className="mt-8 space-y-9">
          <label className="block"><span className="micro-label">Save more each month</span><span className="font-financial mt-3 block text-3xl">{saving>=0?'+':''}{formatINR(saving)}</span><input type="range" aria-label="Monthly saving change" min="-10000" max="30000" step="1000" value={saving} onChange={e=>setSaving(Number(e.target.value))} className="mt-4 w-full accent-[#e88a34]"/></label>
          <label className="block"><span className="micro-label">Income change</span><span className="font-financial mt-3 block text-3xl">{income>0?'+':''}{income}%</span><input type="range" aria-label="Income change" min="-30" max="30" step="5" value={income} onChange={e=>setIncome(Number(e.target.value))} className="mt-4 w-full accent-[#e88a34]"/></label>
          <label className="block"><span className="micro-label">Add / prepay EMI</span><span className="font-financial mt-3 block text-3xl">{emi>0?'+':''}{formatINR(emi)}</span><input type="range" aria-label="EMI change" min="-15000" max="25000" step="1000" value={emi} onChange={e=>setEmi(Number(e.target.value))} className="mt-4 w-full accent-[#e88a34]"/></label>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">{[['Save ₹10K',10000,0,0],['Salary +10%',5000,10,0],['Income −20%',0,-20,0],['Prepay EMI',5000,0,-8000],['New car EMI',0,0,18000]].map(([label,s,i,e])=><button key={String(label)} onClick={()=>{setSaving(Number(s));setIncome(Number(i));setEmi(Number(e))}} className="border border-border bg-[#f3efe7] px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:border-[#e88a34]">{label}</button>)}</div>
        <div className="mt-8"><PrototypeNote/></div>
      </aside>
      <main className="space-y-6">
        <section className={`border p-7 md:p-10 ${good?'border-[#2d7a65]/30 bg-[#2d7a65]/[.05]':bad?'border-[#b84f49]/30 bg-[#b84f49]/[.05]':'border-border bg-card'}`}>
          <p className="eyebrow">Simulated outcome</p><div className="mt-5 flex flex-wrap items-end justify-between gap-5"><h2 className="max-w-2xl text-3xl font-medium tracking-[-.045em] md:text-5xl">{good?'This strengthens your financial position.':bad?'This increases financial pressure.':'This has limited material impact.'}</h2><p className="font-financial text-6xl">{result.health}<span className="text-lg text-muted-foreground">/100</span></p></div>
        </section>
        <section className="surface">
          <div className="grid grid-cols-[1fr_100px_100px] border-b hairline p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid-cols-[1fr_160px_160px]"><span>Measure</span><span className="text-right">Before</span><span className="text-right">After</span></div>
          {comparison.map(([label,before,after,unit])=>{const display=(v:number)=>unit==='₹'?formatINR(v):`${v}${unit}`; const delta=Number(after)-Number(before); return <div key={String(label)} className="grid grid-cols-[1fr_100px_100px] items-center border-b last:border-b-0 hairline p-4 md:grid-cols-[1fr_160px_160px]"><span className="text-sm font-medium">{label}</span><span className="font-financial text-right text-sm text-muted-foreground">{display(Number(before))}</span><motion.span key={String(after)} initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} className={`font-financial text-right text-lg ${label==='EMI burden'?(delta<=0?'text-[#2d7a65]':'text-[#b84f49]'):(delta>=0?'text-[#2d7a65]':'text-[#b84f49]')}`}>{display(Number(after))}</motion.span></div>})}
        </section>
        <section className="surface p-6 md:p-9"><Trajectory data={trajectory}/></section>
        <section className="surface-dark grid-rule p-7 md:p-9"><p className="eyebrow !text-[#e88a34]">What changes in the system</p><div className="mt-7 grid gap-px bg-white/10 border border-white/10 sm:grid-cols-3">{[['Cash flow',formatINR(result.monthlySurplus)],['Resilience',`${result.buffer} months`],['Debt load',`${result.emiBurden}%`]].map(([a,b])=><div key={a} className="bg-[#071a17] p-5"><p className="micro-label !text-white/30">{a}</p><p className="font-financial mt-4 text-2xl">{b}</p></div>)}</div><a href="/loan-decision" className="mt-7 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#e88a34]">Take this to Loan Lab <ArrowRight className="h-4 w-4"/></a></section>
      </main>
    </div>
  </div>;
}
