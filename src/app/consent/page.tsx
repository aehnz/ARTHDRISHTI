'use client';

import { Check, Eye, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';

export default function ConsentPage(){
  const {demoState,refreshIntelligence}=useApp(); const consentItems=demoState.consentItems;
  const [overrides,setOverrides]=useState<Record<string,boolean>>({});
  const isEnabled=(id:string)=>overrides[id]??consentItems.find(item=>item.id===id)?.status==='consented';
  const change=async(id:string,next:boolean)=>{const previous=isEnabled(id);setOverrides(value=>({...value,[id]:next}));try{await api.updateConsent(id,next?'consented':'not_consented');refreshIntelligence()}catch{setOverrides(value=>({...value,[id]:previous}))}};
  const revokeOptional=async()=>{const optional=consentItems.filter(item=>!item.required);setOverrides(value=>({...value,...Object.fromEntries(optional.map(item=>[item.id,false]))}));await Promise.allSettled(optional.map(item=>api.updateConsent(item.id,'not_consented')));refreshIntelligence()};
  return <div>
    <PageHeader eyebrow="Trust · Consent center" title="Your data. A clear purpose. Your control." description="Consent is granular, purpose-specific and revocable. ARTHDRISHTI does not use a data source simply because it is available." aside={<div className="flex items-center gap-3 text-[#2d7a65]"><ShieldCheck/><span className="text-xs font-bold uppercase tracking-wider">Consent active</span></div>} />
    <section className="page-wrap grid gap-8 py-8 lg:grid-cols-[1.2fr_.8fr]">
      <div className="surface"><div className="grid grid-cols-[1fr_auto] border-b hairline p-6"><div><p className="eyebrow">Data permissions</p><p className="mt-3 text-sm text-muted-foreground">Change any optional permission independently.</p></div><LockKeyhole className="h-5 w-5 text-[#e88a34]"/></div>
        {consentItems.map(item=><div key={item.id} className="grid gap-5 border-b last:border-b-0 hairline p-6 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><div className="flex items-center gap-3"><h2 className="text-base font-semibold">{item.category}</h2>{item.required&&<span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Required</span>}</div><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p></div><div className="border-l-2 border-[#e88a34] pl-4"><p className="micro-label">Purpose</p><p className="mt-2 text-xs leading-5">{item.purpose}</p></div><button role="switch" aria-label={`${isEnabled(item.id)?'Disable':'Enable'} ${item.category} consent`} aria-checked={isEnabled(item.id)} disabled={item.required} onClick={()=>change(item.id,!isEnabled(item.id))} className={`relative h-7 w-12 rounded-full transition ${isEnabled(item.id)?'bg-[#2d7a65]':'bg-[#b8afa0]'} disabled:opacity-60`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${isEnabled(item.id)?'left-6':'left-1'}`}/></button></div>)}
      </div>
      <aside className="space-y-5"><div className="surface-dark grid-rule p-7"><Eye className="h-5 w-5 text-[#e88a34]"/><p className="eyebrow mt-7 !text-[#e88a34]">What changes when you revoke?</p><div className="mt-7 space-y-5">{[['Transaction history','Spending insights and lineage pause.'],['EMI and debt','Loan suitability cannot be simulated.'],['Savings','Buffer and resilience become partial.'],['Anomaly detection','Behavioural protection stops.']].map(([a,b])=><div key={a} className="border-b border-white/10 pb-4"><p className="text-sm font-semibold">{a}</p><p className="mt-2 text-xs leading-5 text-white/42">{b}</p></div>)}</div></div><div className="border-l-2 border-[#2d7a65] bg-[#2d7a65]/8 p-6"><div className="flex items-center gap-3"><Check className="h-4 w-4 text-[#2d7a65]"/><p className="text-sm font-semibold">No effect on core account access</p></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Revoking optional intelligence permissions does not block secure account access.</p></div><button onClick={revokeOptional} className="flex w-full items-center justify-between border border-border bg-card p-5 text-xs font-bold uppercase tracking-wider"><span className="flex items-center gap-3"><RotateCcw className="h-4 w-4"/>Revoke optional consent</span><span>→</span></button></aside>
    </section>
  </div>;
}
