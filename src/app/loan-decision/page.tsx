'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, ChevronRight, Shield, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DecisionMark, PageHeader, PrototypeNote } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import type { LoanAssessment } from '@/types';

export default function LoanDecisionPage() {
  const { demoState } = useApp();
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(60);
  const [apr, setApr] = useState(13.2);
  const [purpose, setPurpose] = useState('Personal need');
  const [assessment, setAssessment] = useState<LoanAssessment>(demoState.loanAssessment);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => api.simulateLoan(amount, tenure, apr, purpose)
      .then(result => { if (active) { setAssessment(result); setSimulationError(null); } })
      .catch(error => { if (active) setSimulationError(error instanceof Error ? error.message : 'Simulation unavailable.'); })
      , 120);
    return () => { active = false; window.clearTimeout(timer); };
  }, [amount, tenure, apr, purpose]);
  const no = assessment.recommendation === 'NOT_RECOMMENDED_RIGHT_NOW' || assessment.recommendation === 'BLOCKED';
  const maxBurden = Math.max(65, assessment.affordabilityRatio + 5);
  return <div>
    <PageHeader eyebrow="Decisions · Loan lab" title="Borrowing, tested against your financial life." description="We are not simply deciding whether you can borrow. We are evaluating whether this obligation is financially suitable for you right now." aside={<DecisionMark decision={assessment.recommendation} />} />
    <div className="page-wrap grid gap-6 py-8 lg:grid-cols-[.72fr_1.28fr]">
      <aside className="surface h-fit lg:sticky lg:top-[96px]">
        <div className="flex items-center gap-3 border-b hairline p-6"><SlidersHorizontal className="h-4 w-4 text-[#e88a34]"/><p className="eyebrow">Simulation inputs</p></div>
        <div className="space-y-8 p-6">
          <label className="block"><span className="micro-label">Loan amount</span><span className="font-financial mt-3 block text-4xl">{formatINR(amount)}</span><input aria-label="Loan amount" type="range" min="100000" max="1500000" step="50000" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="mt-5 w-full accent-[#e88a34]" /><span className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>₹1L</span><span>₹15L</span></span></label>
          <label className="block"><span className="micro-label">Tenure</span><span className="font-financial mt-3 block text-3xl">{tenure} months</span><input aria-label="Tenure" type="range" min="12" max="84" step="12" value={tenure} onChange={e=>setTenure(Number(e.target.value))} className="mt-5 w-full accent-[#e88a34]" /></label>
          <label className="block"><span className="micro-label">Illustrative APR</span><span className="font-financial mt-3 block text-3xl">{apr.toFixed(1)}%</span><input aria-label="Illustrative APR" type="range" min="10" max="20" step=".2" value={apr} onChange={e=>setApr(Number(e.target.value))} className="mt-5 w-full accent-[#e88a34]" /></label>
          <label className="block"><span className="micro-label">Purpose</span><select value={purpose} onChange={e=>setPurpose(e.target.value)} className="mt-3 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none"><option>Personal need</option><option>Medical expense</option><option>Home improvement</option><option>Debt consolidation</option><option>Education</option></select></label>
        </div>
        <div className="border-t hairline p-6"><PrototypeNote /></div>
      </aside>

      <div className="space-y-6">
        <motion.section key={`${assessment.requestedAmount}-${assessment.tenure}-${assessment.apr}`} initial={{opacity:.6,y:5}} animate={{opacity:1,y:0}} className={`border p-6 md:p-9 ${no ? 'border-[#b84f49]/30 bg-[#b84f49]/[.045]' : 'border-[#2d7a65]/30 bg-[#2d7a65]/[.045]'}`}>
          <p className="eyebrow">{no ? 'Protection decision' : 'Suitability decision'}</p>
          <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div><DecisionMark decision={assessment.recommendation}/><h2 className="mt-7 max-w-2xl text-3xl font-medium leading-tight tracking-[-.045em] md:text-5xl">{no ? 'This obligation would materially increase financial stress.' : 'This can fit, with the right guardrails.'}</h2></div>
            <div className="shrink-0 text-right"><p className="micro-label">Confidence</p><p className="font-financial mt-2 text-4xl">{Math.round(assessment.governance.confidence*100)}%</p></div>
          </div>
          <p className="mt-7 max-w-3xl text-sm leading-6 text-muted-foreground">{no ? 'This is protection, not rejection. Strengthen your buffer first, then revisit the decision from a more resilient position.' : 'The simulation remains within the current affordability band, but actual eligibility and approval require lender underwriting.'}</p>
          {simulationError&&<p className="mt-3 text-xs text-[#b84f49]">{simulationError}</p>}
        </motion.section>

        <section className="surface">
          <div className="border-b hairline p-6"><p className="eyebrow">Live financial impact</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['New EMI',formatINR(assessment.monthlyEmi),`for ${tenure} months`],
              ['Total EMIs',formatINR(assessment.totalEmiAfter),`was ${formatINR(demoState.financialState.debt.existingEmi)}`],
              ['EMI burden',`${assessment.affordabilityRatio}%`,`was ${demoState.financialState.debt.emiBurdenRatio}%`],
              ['Health impact',`${assessment.healthAfter}/100`,`was ${demoState.financialState.healthScore}`],
            ].map(([a,b,c],i)=><motion.div key={a} className={`p-6 ${i?'border-t hairline sm:border-l sm:border-t-0':''}`} initial={{opacity:0}} animate={{opacity:1}}><p className="micro-label">{a}</p><p className="font-financial mt-5 text-3xl">{b}</p><p className={`mt-2 text-[11px] ${i>1&&no?'text-[#b84f49]':'text-muted-foreground'}`}>{c}</p></motion.div>)}
          </div>
          <div className="grid gap-8 border-t hairline p-6 md:grid-cols-2 md:p-8">
            <div><p className="micro-label mb-5">Burden before and after</p>
              {[['Current',demoState.financialState.debt.emiBurdenRatio,'#64716d'],['With this loan',assessment.affordabilityRatio,no?'#b84f49':'#2d7a65']].map(([label,value,color])=><div key={String(label)} className="mb-5"><div className="mb-2 flex justify-between text-xs"><span>{label}</span><b className="font-financial">{value}%</b></div><div className="h-2 bg-secondary"><motion.div className="h-full" style={{background:String(color)}} initial={{width:0}} animate={{width:`${Math.min(100,Number(value)/maxBurden*100)}%`}} /></div></div>)}
              <div className="relative mt-1 h-5 border-t border-dashed border-[#b84f49]/50"><span className="absolute right-[23%] top-1 text-[9px] text-[#b84f49]">high-stress range</span></div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border border border-border">
              {[['Buffer after',`${assessment.bufferAfterEmi} mo`],['Monthly headroom',formatINR(assessment.remainingCashFlow)],['Affordability',assessment.affordabilityBand],['Purpose',purpose]].map(([a,b])=><div key={a} className="bg-card p-4"><p className="micro-label">{a}</p><p className="mt-3 text-sm font-semibold">{b}</p></div>)}
            </div>
          </div>
        </section>

        <section className="surface-dark grid-rule p-6 md:p-9">
          <div className="flex items-center gap-3 text-[#e88a34]"><BrainCircuit className="h-5 w-5"/><p className="eyebrow !text-[#e88a34]">Why?</p></div>
          <h2 className="mt-5 text-3xl font-medium tracking-[-.045em]">The decision is decomposable.</h2>
          <div className="mt-8 grid gap-px bg-white/10 border border-white/10 md:grid-cols-2">
            {assessment.reasoning.map((reason,i)=><div key={reason} className="flex gap-4 bg-[#071a17] p-5"><span className="font-financial text-xs text-[#e88a34]">0{i+1}</span><p className="text-sm leading-6 text-white/58">{reason}</p></div>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/governance" className="inline-flex items-center gap-3 bg-[#e88a34] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#10211d]">Inspect governance <ChevronRight className="h-4 w-4"/></Link><Link href="/explain" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/60">Full explanation <ArrowRight className="h-4 w-4"/></Link></div>
        </section>

        {no && <section className="border-l-4 border-[#e88a34] bg-[#e9e3d8] p-7 md:p-9"><div className="flex items-start gap-4"><Shield className="mt-1 h-6 w-6 text-[#a46020]"/><div><p className="eyebrow">A better next move</p><h2 className="mt-4 text-3xl font-medium tracking-[-.04em]">Build your 90-day buffer.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Recover liquidity, reduce avoidable spending and reassess when the simulated burden no longer erodes your resilience.</p><Link href="/recovery" className="mt-6 inline-flex items-center gap-3 bg-[#102b26] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Open recovery simulator <ArrowRight className="h-4 w-4"/></Link></div></div></section>}
      </div>
    </div>
  </div>;
}
