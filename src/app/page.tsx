'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, BrainCircuit, Eye, HeartPulse, Shield, X } from 'lucide-react';

const philosophy = [
  { n: '01', title: 'Understand', copy: 'Connect transactions into a living model of income, obligations, behaviour and goals.', icon: Eye },
  { n: '02', title: 'Protect', copy: 'Detect financial stress and unusual behaviour before they become expensive problems.', icon: Shield },
  { n: '03', title: 'Grow', copy: 'Recommend progress only when the customer is genuinely ready for it.', icon: HeartPulse },
];

export default function LandingPage() {
  return <div className="bg-[#071a17] text-[#fffaf0]">
    <section className="adaptive-viewport-section noise grid-rule relative overflow-hidden">
      <div className="absolute left-[7vw] top-0 h-full w-px bg-white/[.06]" />
      <div className="absolute right-[12vw] top-0 h-full w-px bg-white/[.06]" />
      <div className="adaptive-viewport-section landing-hero-content page-wrap relative z-10 grid items-end gap-12 pb-10 pt-20 lg:grid-cols-[1.2fr_.8fr] lg:pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <div className="mb-8 flex items-center gap-3"><span className="h-px w-12 bg-[#e88a34]" /><p className="eyebrow !text-[#e88a34]">Financial intelligence for Bharat</p></div>
          <h1 className="display-title max-w-[950px]">Your bank sees transactions.<br/><span className="text-[#e88a34]">ARTHDRISHTI</span> sees financial life.</h1>
          <p className="body-large mt-8 max-w-2xl !text-white/48">A governed intelligence layer that understands before recommending, explains before influencing, and protects before selling.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex items-center gap-3 bg-[#e88a34] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#10211d]">Explore demo accounts <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="inline-flex items-center gap-3 border border-white/18 px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-white/72">Sign in securely</Link>
          </div>
        </motion.div>
        <motion.div className="relative self-center lg:justify-self-end" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25, duration: .9 }}>
          <div className="relative grid aspect-square w-[330px] max-w-full place-items-center sm:w-[410px]">
            {[1, .72, .44].map((scale) => <div key={scale} className="absolute rounded-full border border-white/10" style={{ width: `${scale*100}%`, height: `${scale*100}%` }} />)}
            <div className="absolute h-[86%] w-[86%] animate-[spin_28s_linear_infinite] rounded-full border border-dashed border-[#e88a34]/25" />
            <div className="text-center"><Eye className="mx-auto h-14 w-14 text-[#e88a34]"/><p className="mt-5 text-[10px] font-bold uppercase tracking-[.22em] text-white/35">Understand the whole picture</p><p className="mt-5 max-w-[190px] text-xs leading-5 text-white/46">State appears only after a secure session begins</p></div>
            <span className="absolute right-2 top-1/2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#e88a34]"><span className="h-2 w-2 rounded-full bg-[#e88a34] breathe" />Session ready</span>
          </div>
        </motion.div>
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[.2em] text-white/28 xl:flex"><ArrowDown className="h-3 w-3" />Scroll to understand</div>
      </div>
    </section>

    <section className="border-y border-white/10 bg-[#0c211d]">
      <div className="page-wrap grid md:grid-cols-3">
        {philosophy.map((item, i) => <div key={item.title} className={`px-2 py-12 md:px-8 md:py-16 ${i ? 'border-t border-white/10 md:border-l md:border-t-0' : ''}`}><div className="flex items-center justify-between"><span className="font-financial text-xs text-[#e88a34]">{item.n}</span><item.icon className="h-5 w-5 text-white/30" /></div><h2 className="mt-10 text-3xl font-medium tracking-[-.045em]">{item.title}</h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/45">{item.copy}</p></div>)}
      </div>
    </section>

    <section className="page-section bg-[#f3efe7] text-[#10211d]">
      <div className="page-wrap">
        <p className="eyebrow">The ARTHDRISHTI difference</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div><h2 className="section-title">Good banking doesn’t always say yes.</h2><p className="body-large mt-6 max-w-lg">A “no” can be the most valuable recommendation when it comes with evidence, empathy and a better path forward.</p></div>
          <div className="surface overflow-hidden">
            <div className="border-b hairline p-6 md:p-8"><p className="micro-label">Customer asks</p><p className="mt-4 text-xl font-medium md:text-2xl">“Mujhe ₹5 lakh ka personal loan lena chahiye?”</p></div>
            <div className="grid md:grid-cols-2">
              <div className="p-6 md:p-8">
                <p className="micro-label">Financial state</p>
                {[['Income','Consent-scoped'],['Existing EMI','Evaluated'],['Current burden','Calculated'],['Buffer','Measured'],['Cash flow','Observed']].map(([a,b]) => <div key={a} className="flex items-center justify-between border-b hairline py-3 text-sm"><span className="text-muted-foreground">{a}</span><span className="font-financial">{b}</span></div>)}
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><BrainCircuit className="h-4 w-4 text-[#e88a34]" />Controlled affordability simulation</div>
              </div>
              <div className="bg-[#102b26] p-6 text-[#fffaf0] md:p-8">
                <p className="micro-label !text-white/35">Governed outcome</p>
                <div className="mt-5 flex items-center gap-3 text-[#e98a7e]"><span className="grid h-9 w-9 place-items-center border border-[#b84f49]/60"><X className="h-4 w-4" /></span><span className="text-xs font-bold uppercase tracking-[.15em]">Not recommended right now</span></div>
                <div className="mt-7 space-y-3 text-sm text-white/54"><p>Projected new EMI <b className="float-right font-financial text-white">Derived</b></p><p>Projected burden <b className="float-right font-financial text-[#e98a7e]">Governed</b></p></div>
                <div className="mt-8 border-t border-white/10 pt-6"><p className="micro-label !text-[#e88a34]">Better alternative</p><p className="mt-3 text-xl font-medium">Build your 90-day buffer</p><Link href="/loan-decision" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e88a34]">Inspect the decision <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section border-t border-white/10">
      <div className="page-wrap grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="eyebrow !text-[#e88a34]">A responsible intelligence architecture</p><h2 className="section-title mt-5 max-w-4xl">Understand → protect → help decide → govern → explain.</h2><p className="body-large mt-7 max-w-2xl !text-white/45">The language model communicates. A deterministic decision engine remains authoritative for suitability, risk and high-impact recommendations.</p></div>
        <Link href="/login" className="inline-flex h-16 items-center gap-4 border border-white/15 px-6 text-xs font-bold uppercase tracking-[.14em] transition hover:bg-white/[.05]">Begin securely <ArrowRight className="h-4 w-4 text-[#e88a34]" /></Link>
      </div>
      <div className="page-wrap mt-16 grid grid-cols-2 gap-px bg-white/10 border border-white/10 sm:grid-cols-4 lg:grid-cols-8">
        {['Customer data','Feature engineering','Financial state','Risk models','Decision engine','Governance','Recommendation','Explanation'].map((item, i) => <div key={item} className="bg-[#071a17] p-4"><span className="font-financial text-[10px] text-[#e88a34]">0{i+1}</span><p className="mt-6 text-[11px] leading-4 text-white/56">{item}</p>{i < 7 && <ArrowRight className="mt-4 h-3 w-3 text-white/18" />}</div>)}
      </div>
    </section>
  </div>;
}
