'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Eye, Fingerprint, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/format';
import { api } from '@/lib/api';

export default function ProtectionPage(){
  const {demoState,refreshIntelligence}=useApp(); const [resolving,setResolving]=useState(false);
  const protectionState=demoState.protection;
  const anomaly=protectionState.anomalies[0];
  const live=Boolean(anomaly);
  const resolve=async(status:'CONFIRMED'|'DISPUTED')=>{if(!anomaly)return;setResolving(true);try{await api.resolveProtection(anomaly.id,status);refreshIntelligence()}finally{setResolving(false)}};
  const stress=demoState.financialState;
  return <div>
    <PageHeader eyebrow="Protection · Early warning" title="Protection for transactions and financial stress." description="One system watches for unusual activity. Another notices when the financial cushion is getting thinner." aside={<div className={`flex items-center gap-2 border px-4 py-3 text-xs font-bold uppercase tracking-wider ${live?'border-[#b84f49]/30 bg-[#b84f49]/10 text-[#b84f49]':'border-[#2d7a65]/30 bg-[#2d7a65]/10 text-[#2d7a65]'}`}><span className="status-dot"/>{live?'1 item to verify':'Monitoring active'}</div>} />
    <section className="page-wrap grid gap-6 py-8 lg:grid-cols-[1.25fr_.75fr]">
      <div className={`border ${live?'border-[#b84f49]/35 bg-[#b84f49]/[.045]':'border-border bg-card'}`}>
        <div className="flex items-center justify-between border-b hairline p-6"><div className="flex items-center gap-3"><Fingerprint className={`h-5 w-5 ${live?'text-[#b84f49]':'text-[#2d7a65]'}`}/><p className="eyebrow">Transaction protection</p></div></div>
        <div className="p-6 md:p-9">
          {live&&anomaly?<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><p className="micro-label text-[#b84f49]">Pattern break detected · {anomaly.anomalyMetadata?.confidence??96}% confidence</p><div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="metric-value">{formatINR(anomaly.amount)}</p><h2 className="mt-5 text-2xl font-medium">{anomaly.merchant}</h2><p className="mt-2 text-sm text-muted-foreground">{anomaly.date} · {anomaly.time}</p></div><div className="max-w-xs border-l-2 border-[#b84f49] pl-5 text-sm leading-6 text-muted-foreground">{anomaly.intelligence}</div></div><div className="mt-9 grid gap-px bg-border border border-border sm:grid-cols-3">{(anomaly.anomalyMetadata?.reasons??[]).map((reason,index)=><div key={reason} className="bg-card p-4"><p className="micro-label">Signal {index+1}</p><p className="mt-3 text-sm font-semibold">{reason}</p></div>)}</div><div className="mt-8 flex flex-wrap gap-3"><button disabled={resolving} onClick={()=>void resolve('CONFIRMED')} className="bg-[#102b26] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">This was me</button><button disabled={resolving} onClick={()=>void resolve('DISPUTED')} className="border border-[#b84f49]/40 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#b84f49]">I don’t recognise it</button></div></motion.div>:<AnimatePresence mode="wait"><motion.div key={protectionState.capabilityAvailable?'clear':'limited'} initial={{opacity:0}} animate={{opacity:1}} className="py-8 text-center"><span className="mx-auto grid h-16 w-16 place-items-center border border-[#2d7a65]/30 bg-[#2d7a65]/8 text-[#2d7a65]"><ShieldCheck className="h-7 w-7"/></span><h2 className="mt-6 text-2xl font-medium">{protectionState.capabilityAvailable?'No unresolved anomalies':'Anomaly protection paused'}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{protectionState.limitation??'Your recent transaction pattern is within its expected behavioural range.'}</p></motion.div></AnimatePresence>}
        </div>
      </div>
      <aside className="surface-dark grid-rule p-7"><Eye className="h-5 w-5 text-[#e88a34]"/><p className="eyebrow mt-7 !text-[#e88a34]">Financial stress protection</p><h2 className="mt-4 text-3xl font-medium tracking-[-.045em]">{stress.risk.level==='low'?'Your cushion is resilient.':'Your financial cushion is getting thinner.'}</h2><div className="mt-8 space-y-4 border-t border-white/10 pt-5">{stress.risk.signals.map((signal)=><div key={signal} className="flex items-start gap-3 text-xs leading-5 text-white/52"><span className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${stress.risk.level==='low'?'bg-[#2d7a65]':'bg-[#e88a34]'}`}>{stress.risk.level==='low'?<Check className="h-2.5 w-2.5"/>:<AlertTriangle className="h-2.5 w-2.5"/>}</span>{signal}</div>)}</div><div className="mt-8 border-t border-white/10 pt-6"><p className="micro-label !text-white/30">Protective response</p><p className="mt-3 text-sm text-white/68">{stress.risk.level==='low'?'Monitor and preserve the current reserve.':'Suppress unsuitable borrowing nudges and prioritise buffer recovery.'}</p></div></aside>
    </section>
    <section className="border-t hairline bg-[#e9e3d8] py-10"><div className="page-wrap grid gap-6 sm:grid-cols-3">{[['Unusual amount','Compared with personal baseline'],['Unusual merchant','First-seen and category context'],['Unusual timing','Behavioural hour and sequence']].map(([a,b],i)=><div key={a} className="flex gap-4"><span className="font-financial text-xs text-[#e88a34]">0{i+1}</span><div><p className="text-sm font-semibold">{a}</p><p className="mt-2 text-xs text-muted-foreground">{b}</p></div></div>)}</div></section>
  </div>;
}
