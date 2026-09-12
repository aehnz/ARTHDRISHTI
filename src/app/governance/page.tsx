'use client';

import { Check, CircleAlert, Clock3, X } from 'lucide-react';
import { useState } from 'react';
import { DecisionMark, PageHeader, PrototypeNote } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { evaluateLoan } from '@/data/intelligence';

export default function GovernancePage(){
  const {demoState}=useApp(); const a=evaluateLoan(demoState,500000,60); const [active,setActive]=useState(5);
  const pipeline=[
    ['AI proposal','A ₹5 lakh borrowing question was converted into a structured simulation request.','passed'],
    ...a.governance.checks.map(c=>[c.name,c.detail,c.status]),
    ['Final action',a.recommendation==='RECOMMENDED'?'Recommendation may be shown.':'Product recommendation suppressed. Recovery action generated.',a.recommendation==='RECOMMENDED'?'passed':'failed'],
  ] as string[][];
  const audit=[['10:42:31','Affordability evaluated'],['10:42:32','Financial stress signal inspected'],['10:42:32','Suitability threshold crossed'],['10:42:32','Product recommendation suppressed'],['10:42:33','Recovery action generated'],['10:42:33','Explanation trail attached']];
  return <div>
    <PageHeader eyebrow="Trust · Governance core" title="The model proposes. Governance decides." description="Every high-impact action passes through purpose, fairness, suitability, stress, anti-predatory and explainability checks." aside={<DecisionMark decision={a.recommendation}/>} />
    <section className="surface-dark grid-rule py-12"><div className="page-wrap grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
      <div><p className="eyebrow !text-[#e88a34]">Decision pipeline</p><h2 className="mt-4 text-3xl font-medium tracking-[-.045em]">Ten gates. One accountable outcome.</h2>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">{pipeline.map(([name,,status],i)=><button key={name} onClick={()=>setActive(i)} className={`flex items-center gap-4 border p-4 text-left transition ${active===i?'border-[#e88a34] bg-white/[.07]':'border-white/10 bg-[#071a17] hover:bg-white/[.04]'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center ${status==='passed'?'bg-[#2d7a65]/20 text-[#75bca5]':status==='failed'?'bg-[#b84f49]/20 text-[#e98a7e]':'bg-[#e88a34]/15 text-[#f0a45c]'}`}>{status==='passed'?<Check className="h-3.5 w-3.5"/>:status==='failed'?<X className="h-3.5 w-3.5"/>:<CircleAlert className="h-3.5 w-3.5"/>}</span><div><span className="font-financial text-[9px] text-white/28">0{String(i+1).padStart(2,'0')}</span><p className="mt-1 text-sm font-medium">{name}</p></div></button>)}</div>
      </div>
      <aside className="border border-white/10 bg-[#0c211d] p-7 lg:sticky lg:top-24 lg:h-fit"><p className="eyebrow !text-white/30">Inspecting stage {active+1}</p><h3 className="mt-5 text-2xl font-medium tracking-[-.04em]">{pipeline[active][0]}</h3><p className="mt-4 text-sm leading-6 text-white/52">{pipeline[active][1]}</p><div className="mt-8 border-t border-white/10 pt-6"><p className="micro-label !text-white/28">Outcome</p><p className={`mt-3 text-xs font-bold uppercase tracking-wider ${pipeline[active][2]==='passed'?'text-[#75bca5]':pipeline[active][2]==='failed'?'text-[#e98a7e]':'text-[#f0a45c]'}`}>{pipeline[active][2]}</p></div></aside>
    </div></section>
    <section className="page-section"><div className="page-wrap grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
      <div><p className="eyebrow">ARTHDRISHTI can say no</p><h2 className="section-title mt-5">Protection is a valid product outcome.</h2><p className="body-large mt-6">“Not recommended right now” is not a rejection. It prevents a sales nudge from weakening the customer’s financial resilience.</p><div className="mt-8"><PrototypeNote/></div></div>
      <div className="surface p-6 md:p-8"><div className="flex items-center justify-between"><div><p className="eyebrow">Audit timeline</p><h3 className="mt-3 text-2xl font-medium tracking-[-.04em]">Decision trace · sim-5L-0926</h3></div><Clock3 className="h-5 w-5 text-[#e88a34]"/></div><div className="mt-7">{audit.map(([time,event],i)=><div key={event} className="grid grid-cols-[80px_16px_1fr] gap-3"><span className="font-financial py-3 text-[11px] text-muted-foreground">{time}</span><div className="relative flex justify-center"><span className={`mt-4 h-2 w-2 rounded-full ${i>2?'bg-[#e88a34]':'bg-[#2d7a65]'}`}/>{i<audit.length-1&&<span className="absolute bottom-0 top-5 w-px bg-border"/>}</div><p className="border-b hairline py-3 text-sm">{event}</p></div>)}</div></div>
    </div></section>
  </div>;
}
