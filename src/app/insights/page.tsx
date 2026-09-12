'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, CircleDollarSign, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Lineage, PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/format';

const iconFor = { 'money-leak': CircleDollarSign, risk: ShieldAlert, opportunity: TrendingUp, behaviour: Sparkles, positive: TrendingUp };

export default function InsightsPage(){
  const {demoState}=useApp(); const [open,setOpen]=useState<string|null>(demoState.insights[0]?.id??null);
  const leak=demoState.financialState.spending.potentialLeaks;
  return <div>
    <PageHeader eyebrow="Intelligence · Insights" title="Signals, ranked by consequence." description="No generic AI feed. Each insight carries confidence, impact, evidence and a practical next move." aside={<div className="text-right"><p className="font-financial text-3xl">{formatINR(leak)}</p><p className="micro-label mt-2">potential monthly savings</p></div>} />
    <section className="page-wrap grid gap-8 py-8 lg:grid-cols-[1.25fr_.75fr]">
      <div>
        {demoState.insights.map((insight)=>{const Icon=iconFor[insight.category]; const active=open===insight.id; return <article key={insight.id} className="border-t hairline">
          <button onClick={()=>setOpen(active?null:insight.id)} className="grid w-full gap-5 py-6 text-left md:grid-cols-[42px_1fr_auto] md:items-start">
            <span className={`grid h-10 w-10 place-items-center border ${insight.type==='positive'?'border-[#2d7a65]/30 bg-[#2d7a65]/8 text-[#2d7a65]':insight.type==='warning'?'border-[#b84f49]/30 bg-[#b84f49]/8 text-[#b84f49]':'border-[#e88a34]/30 bg-[#e88a34]/8 text-[#a46020]'}`}><Icon className="h-4 w-4"/></span>
            <div><div className="flex flex-wrap items-center gap-3"><span className="micro-label">{insight.category.replace('-',' ')}</span><span className="font-financial text-[10px] text-muted-foreground">{insight.confidence}% confidence</span></div><h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">{insight.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{insight.description}</p><p className="mt-4 text-xs font-semibold text-[#a46020]">{insight.impact}</p></div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${active?'rotate-180':''}`}/>
          </button>
          <AnimatePresence>{active&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden pb-7"><Lineage insight={insight} state={demoState}/></motion.div>}</AnimatePresence>
        </article>})}
      </div>
      <aside className="space-y-5"><div className="surface-dark grid-rule p-7"><p className="eyebrow !text-[#e88a34]">Financial leak detector</p><p className="font-financial mt-6 text-5xl">{formatINR(leak)}</p><p className="mt-2 text-xs text-white/38">estimated recoverable each month</p><div className="mt-7 space-y-4 border-t border-white/10 pt-5">{[['Low-use subscription','₹699'],['Food delivery drift','₹2,840'],['Shopping spikes','₹1,120']].map(([a,b])=><div key={a} className="flex justify-between text-xs"><span className="text-white/48">{a}</span><b className="font-financial">{b}</b></div>)}</div><p className="mt-7 text-xs leading-5 text-white/46">Redirecting this amount to emergency savings could reach the target approximately 4 months sooner.</p><Link href="/goals" className="mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#e88a34]">See goal impact <ArrowRight className="h-4 w-4"/></Link></div><div className="border-l-2 border-[#2d7a65] bg-[#2d7a65]/8 p-6"><p className="eyebrow">Positive signal</p><p className="mt-4 text-sm font-semibold">Stable income remains the foundation.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">ARTHDRISHTI weighs strengths alongside risks so the picture stays balanced.</p></div></aside>
    </section>
  </div>;
}
