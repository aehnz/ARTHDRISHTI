'use client';

import Link from 'next/link';
import { ArrowRight, CalendarCheck, Circle, Flag, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader, Trajectory } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import type { RecoveryPlan } from '@/types';

export default function RecoveryPage() {
  const { demoState } = useApp();
  const [commitment, setCommitment] = useState(80);
  const [plan, setPlan] = useState<RecoveryPlan>(demoState.recoveryPlan);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => api.simulatePlan(commitment).then(result => { if (active) setPlan(result); }).catch(() => undefined), 120);
    return () => { active = false; window.clearTimeout(timer); };
  }, [commitment]);
  const strong = plan.planType === 'GROWTH';
  const base = demoState.financialState;
  const data = plan.trajectory;
  const stepLabels = ['Now','Month 1','Month 2','Month 3'];
  const steps = plan.priorityActions.map((action,index)=>[stepLabels[index]??`Step ${index+1}`,action,index===0?plan.description:'Sequenced from the active backend plan.']);
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
      <div className="surface min-w-0 p-6 md:p-10"><Trajectory data={data}/></div>
      <aside className="min-w-0 space-y-4">
        <div className="surface p-6"><p className="eyebrow">At the end of this plan</p><div className="mt-7 space-y-5">
          {[['Health',`${base.healthScore} → ${data.at(-1)?.health}`],['Buffer',`${base.savings.bufferMonths} → ${data.at(-1)?.buffer} months`],['Monthly headroom',`${formatINR(base.cashFlow.monthlySurplus)} → ${formatINR(data.at(-1)?.cashFlow??0)}`]].map(([a,b])=><div key={a} className="border-b hairline pb-4"><p className="micro-label">{a}</p><p className="font-financial mt-2 text-xl">{b}</p></div>)}
        </div></div>
        <div className="border-l-2 border-[#2d7a65] bg-[#2d7a65]/8 p-6"><Shield className="h-5 w-5 text-[#2d7a65]"/><p className="mt-4 text-sm font-semibold">{strong?'Six-month reserve remains protected.':'No product recommendation is needed right now.'}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{strong?'Only surplus above the reserve target is allocated.':'The highest-value action is restoring financial resilience.'}</p></div>
      </aside>
    </div></section>
    <section className="border-t hairline bg-[#e9e3d8] py-10"><div className="page-wrap flex flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex items-center gap-4"><CalendarCheck className="h-5 w-5 text-[#e88a34]"/><div><p className="font-semibold">{strong?'Growth plan ready':'Recovery plan ready'}</p><p className="mt-1 text-xs text-muted-foreground">All projections use your latest authenticated financial state.</p></div></div><Link href={strong?'/goals':'/what-if'} className="inline-flex items-center gap-3 bg-[#102b26] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">{strong?'Open goals':'Explore an adjustment'}<ArrowRight className="h-4 w-4"/></Link></div></section>
  </div>;
}
