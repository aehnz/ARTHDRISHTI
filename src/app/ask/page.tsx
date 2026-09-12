'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, BrainCircuit, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { evaluateLoan } from '@/data/intelligence';
import { getFallbackResponse } from '@/lib/ai-service';

const prompts=['Mujhe ₹5 lakh ka loan lena chahiye?','Mere kharche kahan badhe?','Why is my buffer falling?','How can I improve my financial health?'];

export default function AskPage(){
  const {language,demoState,chatMessages,addChatMessage}=useApp(); const [input,setInput]=useState(''); const [loading,setLoading]=useState(false);
  const loan=useMemo(()=>evaluateLoan(demoState,500000,60),[demoState]);
  const send=async(text=input)=>{if(!text.trim()||loading)return; addChatMessage({role:'user',content:text.trim()});setInput('');setLoading(true); await new Promise(r=>setTimeout(r,650)); const s=demoState.financialState; const response=getFallbackResponse(text,{customerName:demoState.customer.firstName,financialState:{monthlyIncome:s.income.monthly,existingEmi:s.debt.existingEmi,savings:s.savings.total,bufferMonths:s.savings.bufferMonths,cashFlowTrend:s.cashFlow.trend,emiBurdenRatio:s.debt.emiBurdenRatio,riskLevel:s.risk.level,healthScore:s.healthScore,savingsRate:s.savings.rate,monthlySurplus:s.cashFlow.monthlySurplus},recentInsights:demoState.insights.slice(0,3).map(i=>({title:i.title,type:i.type})),language,loan:{newEmi:loan.monthlyEmi,projectedBurden:loan.affordabilityRatio,decision:loan.recommendation.replaceAll('_',' ')}});addChatMessage({role:'assistant',content:response});setLoading(false)};
  return <div>
    <PageHeader eyebrow="Ask · Context-aware assistant" title="Ask your financial life—not a generic chatbot." description="English, Hindi or Hinglish. ARTHDRISHTI explains controlled decisions; it does not independently make high-impact financial decisions." aside={<div className="flex items-center gap-3 text-[#2d7a65]"><span className="status-dot"/><span className="text-xs font-bold uppercase tracking-wider">Context connected</span></div>} />
    <section className="page-wrap grid gap-6 py-8 lg:grid-cols-[.72fr_1.28fr]">
      <aside className="surface-dark grid-rule h-fit p-7 lg:sticky lg:top-24"><BrainCircuit className="h-5 w-5 text-[#e88a34]"/><p className="eyebrow mt-7 !text-[#e88a34]">Live context</p><h2 className="mt-4 text-2xl font-medium">{demoState.customer.name}</h2><div className="mt-7 space-y-4 border-t border-white/10 pt-5">{[['Health',`${demoState.financialState.healthScore}/100`],['EMI burden',`${demoState.financialState.debt.emiBurdenRatio}%`],['Buffer',`${demoState.financialState.savings.bufferMonths} months`],['Cash flow',demoState.financialState.cashFlow.trend]].map(([a,b])=><div key={a} className="flex justify-between text-xs"><span className="text-white/40">{a}</span><b className="font-financial capitalize">{b}</b></div>)}</div><div className="mt-8 flex gap-3 border-t border-white/10 pt-6"><ShieldCheck className="h-4 w-4 shrink-0 text-[#75bca5]"/><p className="text-[11px] leading-5 text-white/38">Deterministic financial and governance engines remain authoritative. The assistant only communicates their output.</p></div></aside>
      <div className="surface flex min-h-[650px] flex-col">
        <div className="border-b hairline p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-[#102b26] text-[#e88a34]"><Sparkles className="h-4 w-4"/></span><div><p className="text-sm font-semibold">ARTHDRISHTI</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Financial explanation assistant</p></div></div></div>
        <div className="flex-1 space-y-5 p-5 md:p-7">
          {!chatMessages.length&&<div className="py-8"><p className="eyebrow">Suggested questions</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{prompts.map(p=><button key={p} onClick={()=>send(p)} className="border border-border bg-[#f3efe7] p-4 text-left text-sm leading-5 transition hover:border-[#e88a34]">{p}<ArrowRight className="mt-4 h-3.5 w-3.5 text-muted-foreground"/></button>)}</div></div>}
          {chatMessages.map((m,i)=><motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>{m.role==='assistant'&&<span className="grid h-8 w-8 shrink-0 place-items-center bg-[#102b26] text-[#e88a34]"><Bot className="h-4 w-4"/></span>}<div className={`max-w-[82%] whitespace-pre-wrap p-4 text-sm leading-6 ${m.role==='user'?'bg-[#e9e3d8]':'border border-border bg-card'}`}>{m.content}{m.role==='assistant'&&m.content.includes('SIMULATED IMPACT')&&<Link href="/loan-decision" className="mt-5 flex items-center justify-between border-t hairline pt-4 text-xs font-bold uppercase tracking-wider text-[#a46020]">See simulation <ArrowRight className="h-4 w-4"/></Link>}</div></motion.div>)}
          {loading&&<div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-[#e88a34] breathe"/>Reading your financial state…</div>}
        </div>
        <div className="border-t hairline p-4"><div className="flex items-end gap-3 border border-border bg-[#f8f5ee] p-2"><textarea aria-label="Ask ARTHDRISHTI" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} rows={2} placeholder="Ask in English, Hindi or Hinglish…" className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"/><button onClick={()=>send()} disabled={!input.trim()||loading} aria-label="Send message" className="grid h-11 w-11 place-items-center bg-[#102b26] text-white disabled:opacity-35"><Send className="h-4 w-4"/></button></div></div>
      </div>
    </section>
  </div>;
}
