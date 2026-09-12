'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Banknote, ChevronDown, Command,
  Landmark, Menu, MessageCircle, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import type { DemoScenario, Language, PersonaId } from '@/types';

const groups = [
  { label: 'Overview', href: '/dashboard', icon: Activity },
  { label: 'Money', icon: Banknote, items: [
    { label: 'Transactions', href: '/transactions', detail: 'Search, filter and trace' },
    { label: 'Financial DNA', href: '/financial-life', detail: 'Your complete financial state' },
    { label: 'Cash flow', href: '/cash-flow', detail: 'Commitments and timing' },
    { label: 'Goals', href: '/goals', detail: 'Plan and accelerate' },
  ] },
  { label: 'Decisions', icon: Landmark, items: [
    { label: 'Loan Lab', href: '/loan-decision', detail: 'Simulated affordability' },
    { label: 'What-if', href: '/what-if', detail: 'Explore before acting' },
    { label: 'Recovery & growth', href: '/recovery', detail: '90-day action plan' },
    { label: 'Insights', href: '/insights', detail: 'Signals that matter' },
  ] },
  { label: 'Protection', icon: ShieldCheck, items: [
    { label: 'Protection center', href: '/protection', detail: 'Anomalies and financial stress' },
    { label: 'Governance', href: '/governance', detail: 'Inspect the decision pipeline' },
    { label: 'Explainability', href: '/explain', detail: 'Data, logic and alternatives' },
    { label: 'Consent', href: '/consent', detail: 'Control your data' },
  ] },
  { label: 'Ask', href: '/ask', icon: MessageCircle },
];

const commandItems = [
  ['Overview', '/dashboard'], ['Transactions', '/transactions'], ['Cash flow', '/cash-flow'],
  ['Financial DNA', '/financial-life'], ['Loan simulation', '/loan-decision'], ['What-if simulator', '/what-if'],
  ['Recovery plan', '/recovery'], ['Anomaly protection', '/protection'], ['Governance trace', '/governance'],
  ['Explain my score', '/explain'], ['Consent center', '/consent'], ['Customer intelligence matrix', '/customers'], ['Ask ARTHDRISHTI', '/ask'],
];

function Brand() {
  return <Link href="/" aria-label="ARTHDRISHTI home" className="flex items-center gap-3 shrink-0">
    <span className="relative grid h-9 w-9 place-items-center border border-white/20 bg-white/[.06]">
      <span className="absolute h-4 w-4 rotate-45 border border-[#e88a34]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#e88a34]" />
    </span>
    <span className="hidden text-[12px] font-semibold tracking-[.18em] text-[#fffaf0] sm:block">ARTHDRISHTI</span>
  </Link>;
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const results = useMemo(() => commandItems.filter(([name]) => name.toLowerCase().includes(query.toLowerCase())), [query]);
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[100] bg-[#071a17]/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
    <motion.div role="dialog" aria-modal="true" aria-label="Command palette" className="mx-auto mt-[12vh] max-w-xl overflow-hidden border border-white/15 bg-[#0d2420] text-[#fffaf0] shadow-2xl" initial={{ opacity: 0, y: -12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-white/10 px-5">
        <Search className="h-4 w-4 text-[#e88a34]" />
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Escape' && onClose()} placeholder="Search actions, pages or questions…" className="h-16 w-full bg-transparent text-sm outline-none placeholder:text-white/35" />
        <kbd className="border border-white/15 px-2 py-1 text-[10px] text-white/40">ESC</kbd>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {results.map(([name, href]) => <button key={href} onClick={() => { router.push(href); onClose(); }} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/[.06] hover:text-white">
          <span>{name}</span><ArrowUpRight className="h-3.5 w-3.5" />
        </button>)}
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[.16em] text-white/30">Try “loan”, “transactions”, “why”, or “consent”</p>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, persona, setPersona, demoScenario, setDemoScenario } = useApp();
  const [mobile, setMobile] = useState(false);
  const [palette, setPalette] = useState(false);
  const landing = pathname === '/';
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); setPalette(true); } };
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, []);
  return <div className="min-h-screen">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071a17]/95 text-[#fffaf0] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-5 px-4 sm:px-6">
        <Brand />
        <nav className="hidden h-full items-center gap-1 xl:flex" aria-label="Primary navigation">
          {groups.map(group => group.href ? <Link key={group.label} href={group.href} className={`flex h-full items-center gap-2 border-b-2 px-3 text-xs font-medium tracking-wide transition ${pathname.startsWith(group.href) ? 'border-[#e88a34] text-white' : 'border-transparent text-white/58 hover:text-white'}`}><group.icon className="h-3.5 w-3.5" />{group.label}</Link> :
                  <details
                    key={group.label}
                    className="group relative h-full"
                    onMouseLeave={(event) => {
                      event.currentTarget.open = false;
                    }}
                  >
              <summary className="flex h-full cursor-pointer list-none items-center gap-2 border-b-2 border-transparent px-3 text-xs font-medium tracking-wide text-white/58 transition hover:text-white"><group.icon className="h-3.5 w-3.5" />{group.label}<ChevronDown className="h-3 w-3 transition group-open:rotate-180" /></summary>
              <div className="absolute left-0 top-[61px] w-72 border border-white/10 bg-[#0b211d] p-2 shadow-2xl">
                {group.items?.map(item => <Link key={item.href} href={item.href} className="block px-4 py-3 transition hover:bg-white/[.06]"><span className="block text-sm text-white/85">{item.label}</span><span className="mt-1 block text-[11px] text-white/38">{item.detail}</span></Link>)}
              </div>
            </details>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!landing && <div className="hidden items-center border border-white/12 2xl:flex">
            <select aria-label="Demo customer" value={persona} onChange={e => setPersona(e.target.value as PersonaId)} className="h-9 border-0 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-wider text-white outline-none"><option value="ravi">Ravi · Recovery</option><option value="ananya">Ananya · Growth</option></select>
            <span className="h-4 w-px bg-white/12" />
            <select aria-label="Demo scenario" value={demoScenario} onChange={e => setDemoScenario(e.target.value as DemoScenario)} className="h-9 border-0 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-wider text-white outline-none"><option value="stable">Stable</option><option value="tightening">Tightening</option><option value="stress">Financial stress</option><option value="anomaly">Fraud / anomaly</option><option value="growth">Growth</option></select>
          </div>}
          <button onClick={() => setPalette(true)} aria-label="Open command palette" className="hidden h-9 items-center gap-2 border border-white/12 px-3 text-[11px] text-white/55 transition hover:text-white md:flex"><Command className="h-3.5 w-3.5" /><span>⌘K</span></button>
          <div className="hidden items-center gap-1 sm:flex">{(['en','hi','hinglish'] as Language[]).map(lang => <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-2 text-[10px] font-semibold uppercase tracking-wider ${language === lang ? 'text-[#f19a49]' : 'text-white/38 hover:text-white'}`}>{lang === 'hinglish' ? 'Hing' : lang}</button>)}</div>
          {landing && <Link href="/onboarding" className="hidden bg-[#e88a34] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#10211d] sm:block">Enter demo</Link>}
          <button onClick={() => setMobile(!mobile)} aria-label="Toggle menu" className="p-2 2xl:hidden">{mobile ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
    <AnimatePresence>{mobile && <motion.div className="fixed inset-0 z-40 overflow-y-auto bg-[#071a17] px-6 pb-10 pt-24 text-white 2xl:hidden" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}>
      <div className="mb-6 grid grid-cols-2 gap-2">
        <select aria-label="Customer" value={persona} onChange={e => setPersona(e.target.value as PersonaId)} className="border border-white/15 bg-white/[.04] p-3 text-xs"><option value="ravi">Ravi · Recovery</option><option value="ananya">Ananya · Growth</option></select>
        <select aria-label="Scenario" value={demoScenario} onChange={e => setDemoScenario(e.target.value as DemoScenario)} className="border border-white/15 bg-white/[.04] p-3 text-xs"><option value="stable">Stable</option><option value="tightening">Tightening</option><option value="stress">Stress</option><option value="anomaly">Anomaly</option><option value="growth">Growth</option></select>
      </div>
      <div className="mb-6 flex border border-white/15 p-1">{(['en','hi','hinglish'] as Language[]).map(lang => <button key={lang} onClick={() => setLanguage(lang)} className={`flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${language === lang ? 'bg-[#e88a34] text-[#10211d]' : 'text-white/40'}`}>{lang === 'hinglish' ? 'Hinglish' : lang}</button>)}</div>
      {groups.map(group => <div key={group.label} className="border-t border-white/10 py-4"><p className="eyebrow !text-white/30">{group.label}</p>{group.href ? <Link onClick={() => setMobile(false)} href={group.href} className="mt-3 flex items-center justify-between text-xl">{group.label}<ArrowUpRight /></Link> : group.items?.map(item => <Link key={item.href} onClick={() => setMobile(false)} href={item.href} className="flex items-center justify-between py-3 text-lg text-white/75">{item.label}<ArrowUpRight className="h-4 w-4" /></Link>)}</div>)}
    </motion.div>}</AnimatePresence>
    <main className="min-h-screen pt-[72px]">{children}</main>
    <CommandPalette open={palette} onClose={() => setPalette(false)} />
    {!landing && <div className="fixed bottom-4 right-4 z-30 hidden items-center gap-2 border border-[#d9d2c5] bg-[#faf8f3]/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#64716d] shadow-lg backdrop-blur md:flex"><Sparkles className="h-3.5 w-3.5 text-[#e88a34]" />Deterministic demo</div>}
  </div>;
}
