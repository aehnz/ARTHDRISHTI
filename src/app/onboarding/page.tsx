'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Database, Eye, Fingerprint, Globe2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import type { Language } from '@/types';

const steps = ['Profile', 'Goals', 'Connect', 'Consent', 'Understand', 'Ready'];
const inference = ['Reading connected transaction patterns…', 'Understanding recurring commitments…', 'Estimating financial resilience…', 'Building your financial state…'];
const allConsent = ['transaction_history', 'income', 'debt', 'savings', 'spending_categories', 'anomaly_detection'];

export default function OnboardingPage() {
  const router = useRouter();
  const { auth, language, setLanguage, refreshSession } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(auth?.user.name === 'New customer' ? '' : auth?.user.name ?? '');
  const [goals, setGoals] = useState(['Build emergency fund']);
  const [consents, setConsents] = useState(allConsent);
  const [inferenceStep, setInferenceStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (auth?.onboarding.status === 'complete') router.replace('/dashboard'); }, [auth, router]);
  useEffect(() => {
    if (step !== 4) return;
    const timer = globalThis.setInterval(() => setInferenceStep(value => {
      if (value >= inference.length - 1) { globalThis.clearInterval(timer); globalThis.setTimeout(() => setStep(5), 450); return value; }
      return value + 1;
    }), 600);
    return () => globalThis.clearInterval(timer);
  }, [step]);

  async function advance(action: () => Promise<unknown>) {
    setBusy(true); setError('');
    try { await action(); setStep(value => Math.min(5, value + 1)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save this step.'); }
    finally { setBusy(false); }
  }

  async function finish() {
    setBusy(true); setError('');
    try { await api.completeOnboarding(); await refreshSession(); router.push('/dashboard'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to complete onboarding.'); }
    finally { setBusy(false); }
  }

  return <div className="min-h-[calc(100dvh-72px)] bg-[#071a17] text-[#fffaf0]"><div className="adaptive-viewport-section grid lg:grid-cols-[.42fr_.58fr]">
    <aside className="onboarding-aside grid-rule noise hidden border-r border-white/10 p-10 lg:flex lg:flex-col"><div className="relative z-10"><p className="eyebrow !text-[#e88a34]">Financial intelligence for Bharat</p><h1 className="onboarding-intro-title mt-6 text-5xl font-medium leading-[.98] tracking-[-.06em]">A financial life is more than a balance.</h1><p className="onboarding-intro-copy mt-6 text-sm leading-6 text-white/42">Your choices are persisted by the backend and tied to this signed-in account.</p></div><div className="onboarding-progress relative z-10 flex flex-1 items-end"><div className="onboarding-progress-list">{steps.map((label,index)=><div key={label} className={`flex items-center gap-3 text-xs ${index===step?'text-white':index<step?'text-[#75bca5]':'text-white/25'}`}><span className={`grid h-6 w-6 place-items-center border ${index===step?'border-[#e88a34] text-[#e88a34]':index<step?'border-[#2d7a65]':'border-white/10'}`}>{index<step?<Check className="h-3 w-3"/>:<span className="font-financial text-[9px]">0{index+1}</span>}</span>{label}</div>)}</div></div></aside>
    <section className="onboarding-stage flex items-start justify-center p-5 md:p-10 lg:items-center"><div className="onboarding-panel-wrap w-full max-w-2xl"><div className="mb-8 flex items-center gap-2 lg:hidden">{steps.map((_,index)=><span key={index} className={`h-1 flex-1 ${index<=step?'bg-[#e88a34]':'bg-white/10'}`}/>)}</div><AnimatePresence mode="wait">
      {step===0&&<Panel key="profile" icon={<Globe2/>} eyebrow="Your profile" title="How should ARTHDRISHTI know you?" copy="Name and language are stored in your backend profile."><label className="block"><span className="micro-label !text-white/30">Name</span><input value={name} onChange={event=>setName(event.target.value)} className="mt-3 w-full border border-white/15 bg-transparent p-4 outline-none"/></label><div className="mt-5 grid gap-3 sm:grid-cols-3">{([['en','English'],['hi','हिंदी'],['hinglish','Hinglish']] as [Language,string][]).map(([id,label])=><button key={id} onClick={()=>setLanguage(id)} className={`border p-4 text-left ${language===id?'border-[#e88a34] bg-[#e88a34]/10':'border-white/12'}`}>{label}</button>)}</div><Nav next={()=>advance(()=>api.onboardingProfile(name,language))} busy={busy}/></Panel>}
      {step===1&&<Panel key="goals" icon={<Fingerprint/>} eyebrow="Financial intent" title="What should ARTHDRISHTI help protect?" copy="Intent shapes customer-benefit recommendations. It never becomes a sales target."><div className="grid gap-3 sm:grid-cols-2">{['Build emergency fund','Reduce debt pressure','Plan a major purchase','Understand spending'].map(goal=><button key={goal} onClick={()=>setGoals(value=>value.includes(goal)?value.filter(item=>item!==goal):[...value,goal])} className={`flex items-center justify-between border p-4 text-left text-sm ${goals.includes(goal)?'border-[#e88a34] bg-[#e88a34]/8':'border-white/12 text-white/55'}`}>{goal}{goals.includes(goal)&&<Check className="h-4 w-4 text-[#e88a34]"/>}</button>)}</div><Nav back={()=>setStep(0)} next={()=>advance(()=>api.onboardingGoals(goals))} busy={busy}/></Panel>}
      {step===2&&<Panel key="connect" icon={<Database/>} eyebrow="Connect financial data" title="Connect your financial source." copy="This establishes the data access required to understand your financial position."><div className="border border-white/12">{[['Transactions','Spending intelligence'],['Income','Health and affordability'],['EMI & debt','Suitability'],['Savings','Liquidity and resilience']].map(([a,b])=><div key={a} className="flex items-center justify-between border-b last:border-b-0 border-white/10 p-4"><div><p className="text-sm">{a}</p><p className="mt-1 text-[10px] text-white/30">{b}</p></div><Check className="h-4 w-4 text-[#75bca5]"/></div>)}</div><div className="mt-5 flex gap-3 border-l-2 border-[#e88a34] bg-white/[.035] p-4"><LockKeyhole className="h-4 w-4 shrink-0 text-[#e88a34]"/><p className="text-[11px] leading-5 text-white/38">Data access is scoped to this authenticated account.</p></div><Nav back={()=>setStep(1)} next={()=>advance(api.onboardingConnection)} label="Connect financial data" busy={busy}/></Panel>}
      {step===3&&<Panel key="consent" icon={<ShieldCheck/>} eyebrow="Purpose consent" title="Choose what the intelligence may use." copy="Required income and transaction access stays enabled. Optional scopes can be changed later."><div className="space-y-2">{allConsent.map(id=>{const required=id==='transaction_history'||id==='income'; const checked=required||consents.includes(id); return <button key={id} disabled={required} onClick={()=>setConsents(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id])} className="flex w-full items-center justify-between border border-white/12 p-4 text-left text-sm"><span className="capitalize">{id.replaceAll('_',' ')}</span><span className={`grid h-5 w-5 place-items-center border ${checked?'border-[#2d7a65] bg-[#2d7a65]/25 text-[#75bca5]':'border-white/20'}`}>{checked&&<Check className="h-3 w-3"/>}</span></button>})}</div><Nav back={()=>setStep(2)} next={()=>advance(()=>api.onboardingConsent(consents))} busy={busy}/></Panel>}
      {step===4&&<Panel key="understand" icon={<Eye/>} eyebrow="Understanding your financial life" title={inference[inferenceStep]} copy="ARTHDRISHTI is now deriving your session-bound financial state."><div className="mt-10 space-y-4">{inference.map((text,index)=><div key={text} className={`flex items-center gap-4 text-sm ${index<=inferenceStep?'text-white':'text-white/18'}`}><span className={`grid h-7 w-7 place-items-center border ${index<inferenceStep?'border-[#2d7a65] bg-[#2d7a65]/20 text-[#75bca5]':index===inferenceStep?'border-[#e88a34] text-[#e88a34]':'border-white/10'}`}>{index<inferenceStep?<Check className="h-3.5 w-3.5"/>:<span className={index===inferenceStep?'h-1.5 w-1.5 rounded-full bg-[#e88a34] breathe':''}/>}</span>{text}</div>)}</div></Panel>}
      {step===5&&<Panel key="ready" icon={<ShieldCheck/>} eyebrow="ARTHDRISHTI ready" title="Your financial home is ready." copy="Your authenticated profile, onboarding state and consent choices are now persisted by the backend."><button onClick={finish} disabled={busy} className="primary-action">{busy?'Preparing…':'Open financial home'}<ArrowRight className="h-4 w-4"/></button></Panel>}
    </AnimatePresence>{error&&<p role="alert" className="mt-5 text-sm text-[#e98a7e]">{error}</p>}</div></section>
  </div><style jsx global>{`.primary-action{display:inline-flex;align-items:center;gap:.75rem;background:#e88a34;color:#10211d;padding:.9rem 1.25rem;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.primary-action:disabled{opacity:.55}`}</style></div>;
}

function Panel({icon,eyebrow,title,copy,children}:{icon:React.ReactNode;eyebrow:string;title:string;copy:string;children:React.ReactNode}) { return <motion.section className="onboarding-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.35}}><div className="onboarding-panel-header mb-8"><span className="onboarding-panel-icon grid h-12 w-12 place-items-center border border-[#e88a34]/35 bg-[#e88a34]/8 text-[#e88a34] [&>svg]:h-6 [&>svg]:w-6">{icon}</span><p className="onboarding-panel-eyebrow eyebrow mt-10 !text-[#e88a34]">{eyebrow}</p><h2 className="onboarding-panel-title mt-5 text-4xl font-medium leading-[1.02] tracking-[-.05em] md:text-5xl">{title}</h2><p className="onboarding-panel-copy mt-5 max-w-xl text-sm leading-6 text-white/42">{copy}</p></div>{children}</motion.section>; }
function Nav({back,next,label='Continue',busy}:{back?:()=>void;next:()=>void;label?:string;busy:boolean}) { return <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">{back?<button onClick={back} className="flex items-center gap-2 text-xs text-white/40"><ArrowLeft className="h-4 w-4"/>Back</button>:<span/>}<button onClick={next} disabled={busy} className="primary-action">{busy?'Saving…':label}<ArrowRight className="h-4 w-4"/></button></div>; }
