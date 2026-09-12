'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Home, Shield, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/data/intelligence';

export default function GoalsPage() {
  const { demoState }=useApp();
  const [extra,setExtra]=useState(5000);
  return <div>
    <PageHeader eyebrow="Money · Goals" title="Make every surplus rupee move something forward." description="See progress, projected completion and how a higher monthly contribution changes the finish line." aside={<div className="font-financial text-right"><p className="text-3xl">{demoState.goals.length}</p><p className="micro-label mt-2">active goals</p></div>} />
    <section className="page-wrap grid gap-6 py-8 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-5">{demoState.goals.map((goal,index)=>{const progress=Math.min(100,Math.round(goal.current/goal.target*100)); const remaining=goal.target-goal.current; const months=Math.ceil(remaining/(goal.monthlyContribution+extra)); const normal=Math.ceil(remaining/goal.monthlyContribution); return <article key={goal.id} className="surface overflow-hidden"><div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8"><div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-[#e88a34]/30 bg-[#e88a34]/8">{index===0?(goal.icon==='home'?<Home className="h-4 w-4"/>:<Shield className="h-4 w-4"/>):<Target className="h-4 w-4"/>}</span><div><p className="micro-label">Goal {String(index+1).padStart(2,'0')}</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em]">{goal.name}</h2></div></div><p className="font-financial mt-8 text-4xl">{formatINR(goal.current)} <span className="text-base text-muted-foreground">of {formatINR(goal.target)}</span></p></div><div className="text-left md:text-right"><p className="micro-label">Projected</p><p className="mt-3 text-lg font-semibold">{goal.targetDate}</p><p className="mt-2 text-xs text-muted-foreground">{formatINR(goal.monthlyContribution)}/month</p></div></div><div className="h-2 bg-secondary"><motion.div className="h-full bg-[#2d7a65]" initial={{width:0}} whileInView={{width:`${progress}%`}} viewport={{once:true}}/></div><div className="grid grid-cols-3 gap-px bg-border border-t border-border">{[['Progress',`${progress}%`],['With extra',`${months} months`],['Time saved',`${Math.max(0,normal-months)} months`]].map(([a,b])=><div key={a} className="bg-card p-4"><p className="micro-label">{a}</p><p className="font-financial mt-3 text-lg">{b}</p></div>)}</div></article>})}</div>
      <aside className="surface-dark grid-rule h-fit p-7 lg:sticky lg:top-24 md:p-9"><Sparkles className="h-5 w-5 text-[#e88a34]"/><p className="eyebrow mt-7 !text-[#e88a34]">Goal accelerator</p><h2 className="mt-4 text-3xl font-medium tracking-[-.045em]">What if you save more?</h2><label className="mt-8 block"><span className="flex justify-between text-xs text-white/45"><span>Additional monthly contribution</span><b className="font-financial text-white">{formatINR(extra)}</b></span><input aria-label="Extra goal contribution" type="range" min="0" max="30000" step="1000" value={extra} onChange={e=>setExtra(Number(e.target.value))} className="mt-5 w-full accent-[#e88a34]"/></label><div className="mt-8 border-t border-white/10 pt-6"><p className="text-sm leading-6 text-white/52">{extra? `${formatINR(extra)} more per month accelerates every projection above while the financial buffer remains visible.`:'Add an amount to see the impact.'}</p></div><a href="/what-if" className="mt-7 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#e88a34]">Open full what-if <ArrowRight className="h-4 w-4"/></a></aside>
    </section>
  </div>;
}
