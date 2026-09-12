'use client';

import Link from 'next/link';
import { ArrowRight, CalendarCheck, Circle, Flag, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader, Trajectory } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR, pct } from '@/data/intelligence';

export default function RecoveryPage() {
  const { demoState } = useApp();
  const [commitment, setCommitment] = useState(80);
  const strong = demoState.financialState.healthScore >= 80;
  const base = demoState.financialState;
  const data = useMemo(()=> {
    const factor=commitment/100;
    if(strong) return [
      {label:'Today',health:base.healthScore,buffer:base.savings.bufferMonths,cashFlow:base.cashFlow.monthlySurplus},
      {label:'3 months',health:Math.round(base.healthScore+2*factor),buffer:pct(base.savings.bufferMonths+.3*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+4500*factor),projected:true},
      {label:'6 months',health:Math.round(base.healthScore+4*factor),buffer:pct(base.savings.bufferMonths+.6*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+8000*factor),projected:true},
      {label:'12 months',health:Math.min(96,Math.round(base.healthScore+6*factor)),buffer:pct(base.savings.bufferMonths+1.2*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+12000*factor),projected:true},
    ];
    const targetHealth=base.healthScore<40?58:76, targetBuffer=base.healthScore<40?1.7:3.2;
    return [
      {label:'Today',health:base.healthScore,buffer:base.savings.bufferMonths,cashFlow:base.cashFlow.monthlySurplus},
      {label:'30 days',health:Math.round(base.healthScore+(targetHealth-base.healthScore)*.32*factor),buffer:pct(base.savings.bufferMonths+(targetBuffer-base.savings.bufferMonths)*.28*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+2500*factor),projected:true},
      {label:'60 days',health:Math.round(base.healthScore+(targetHealth-base.healthScore)*.68*factor),buffer:pct(base.savings.bufferMonths+(targetBuffer-base.savings.bufferMonths)*.63*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+5200*factor),projected:true},
      {label:'90 days',health:Math.round(base.healthScore+(targetHealth-base.healthScore)*factor),buffer:pct(base.savings.bufferMonths+(targetBuffer-base.savings.bufferMonths)*factor),cashFlow:Math.round(base.cashFlow.monthlySurplus+7600*factor),projected:true},
    ];
  },[base,commitment,strong]);
  const steps = strong ? [
    ['Now','Ring-fence six months of liquidity','Keep resilience intact before allocating surplus.'],
    ['Month 1','Increase home-goal allocation','Move ₹20,000 more each month into the goal vault.'],
    ['Month 3','Review expensive debt','Compare prepayment benefit with goal acceleration.'],
    ['Month 6','Protect future income','Review long-term reserves and income continuity.'],
  ] : [
    ['Week 1','Stop recurring leaks','Cancel low-use subscriptions and set delivery guardrails.'],
    ['Month 1','Stabilise cash flow','Restore salary-day transfer and sequence obligations.'],
    ['Month 2','Create ₹7,000 headroom','Reduce discretionary categories without cutting essentials.'],
    ['Month 3','Build the emergency reserve','Direct recovered headroom into the 90-day buffer.'],
  ];
  return <div>
    <PageHeader eyebrow={strong?'Growth · Wealth acceleration':'Recovery · 90-day plan'} title={strong?'Turn financial strength into faster progress.':'Recovery should feel like a path, not a warning.'} description={strong?'Preserve resilience while accelerating high-priority goals. This is not an investment recommendation.':'A focused plan to restore liquidity, reduce avoidable pressure and rebuild decision-making room.'} aside={<div className="font-financial text-right"><p className="text-4xl">{data.at(-1)?.health}<span className="text-lg text-muted-foreground">/100</span></p><p className="micro-label mt-2">projected outcome</p></div>} />
    <section className="surface-dark grid-rule">
      <div className="page-wrap grid gap-10 py-12 lg:grid-cols-[.65fr_1.35fr] lg:py-16">
        <div><p className="eyebrow !text-[#e88a34]">{strong?'Wealth acceleration plan':'90-day financial recovery plan'}</p><h2 className="mt-5 text-4xl font-medium leading-tight tracking-[-.05em]">{strong?'Grow without weakening what is already strong.':'Small, sequenced moves. Measurable resilience.'}</h2><p className="mt-5 text-sm leading-6 text-white/48">Adjust plan adherence to see how execution quality changes the projected outcome.</p>
          <label className="mt-9 block"><span className="flex justify-between text-xs text-white/50"><span>Plan adherence</span><b className="font-financial text-white">{commitment}%</b></span><input aria-label="Plan adherence" type="range" min="30" max="100" step="5" value={commitment} onChange={e=>setCommitment(Number(e.target.value))} className="mt-4 w-full accent-[#e88a34]"/></label>
        </div>
        <div className="grid gap-px bg-white/10 border border-white/10 sm:grid-cols-2">
          {steps.map(([when,title,copy],i)=><div key={when} className="bg-[#071a17] p-6"><div className="flex items-center justify-between"><span className="font-financial text-xs text-[#e88a34]">0{i+1}</span>{i===0?<Flag className="h-4 w-4 text-[#e88a34]"/>:<Circle className="h-3 w-3 text-white/22"/>}</div><p className="micro-label mt-7 !text-white/28">{when}</p><h3 className="mt-3 text-lg font-medium">{title}</h3><p className="mt-3 text-xs leading-5 text-white/42">{copy}</p></div>)}
        </div>
      </div>
    </section>
    <section className="page-section"><div className="page-wrap grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <div className="surface p-6 md:p-10"><Trajectory data={data}/></div>
      <aside className="space-y-4">
        <div className="surface p-6"><p className="eyebrow">At the end of this plan</p><div className="mt-7 space-y-5">
          {[['Health',`${base.healthScore} → ${data.at(-1)?.health}`],['Buffer',`${base.savings.bufferMonths} → ${data.at(-1)?.buffer} months`],['Monthly headroom',`${formatINR(base.cashFlow.monthlySurplus)} → ${formatINR(data.at(-1)?.cashFlow??0)}`]].map(([a,b])=><div key={a} className="border-b hairline pb-4"><p className="micro-label">{a}</p><p className="font-financial mt-2 text-xl">{b}</p></div>)}
        </div></div>
        <div className="border-l-2 border-[#2d7a65] bg-[#2d7a65]/8 p-6"><Shield className="h-5 w-5 text-[#2d7a65]"/><p className="mt-4 text-sm font-semibold">{strong?'Six-month reserve remains protected.':'No product recommendation is needed right now.'}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{strong?'Only surplus above the reserve target is allocated.':'The highest-value action is restoring financial resilience.'}</p></div>
      </aside>
    </div></section>
    <section className="border-t hairline bg-[#e9e3d8] py-10"><div className="page-wrap flex flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex items-center gap-4"><CalendarCheck className="h-5 w-5 text-[#e88a34]"/><div><p className="font-semibold">{strong?'Growth plan ready':'Recovery plan ready'}</p><p className="mt-1 text-xs text-muted-foreground">All projections update from the active customer and scenario.</p></div></div><Link href={strong?'/goals':'/what-if'} className="inline-flex items-center gap-3 bg-[#102b26] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">{strong?'Open goals':'Test another scenario'}<ArrowRight className="h-4 w-4"/></Link></div></section>
  </div>;
}
