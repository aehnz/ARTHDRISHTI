'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Filter, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/data/intelligence';
import type { Transaction, TransactionCategory } from '@/types';

const categories: Array<'All' | TransactionCategory> = ['All','Salary','Rent','EMI','Food','Dining','Shopping','Mobility','Utilities','Healthcare','Subscriptions','Savings','UPI','Other'];

export default function TransactionsPage() {
  const { demoState } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [type, setType] = useState<'all'|'credit'|'debit'>('all');
  const [sort, setSort] = useState<'recent'|'high'|'low'>('recent');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const rows = demoState.transactions.filter(t => (!q || `${t.description} ${t.merchant} ${t.intelligence}`.toLowerCase().includes(q)) && (category === 'All' || t.category === category) && (type === 'all' || t.type === type));
    return [...rows].sort((a,b) => sort === 'recent' ? `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`) : sort === 'high' ? b.amount-a.amount : a.amount-b.amount);
  }, [demoState.transactions, query, category, type, sort]);
  const grouped = useMemo(() => filtered.reduce<Record<string, Transaction[]>>((acc, t) => { const month = new Date(`${t.date}T12:00:00`).toLocaleDateString('en-IN',{month:'long',year:'numeric'}); (acc[month] ??= []).push(t); return acc; }, {}), [filtered]);

  return <div>
    <PageHeader eyebrow="Money · Transaction intelligence" title="Transactions, with context." description="Search the ledger, inspect behaviour and trace every intelligence signal back to its source." aside={<div className="font-financial text-right"><p className="text-3xl">{filtered.length}</p><p className="micro-label mt-2">matching records</p></div>} />
    <div className="page-wrap py-8">
      <div className="surface grid gap-px bg-border lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="flex h-14 items-center gap-3 bg-card px-4"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search merchant, category or intelligence…" className="w-full bg-transparent text-sm outline-none" /></label>
        <label className="flex h-14 items-center gap-2 bg-card px-4 text-xs text-muted-foreground"><Filter className="h-3.5 w-3.5" /><select value={category} onChange={e=>setCategory(e.target.value as typeof category)} className="bg-transparent font-semibold text-foreground outline-none">{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <select aria-label="Transaction type" value={type} onChange={e=>setType(e.target.value as typeof type)} className="h-14 bg-card px-4 text-xs font-semibold outline-none"><option value="all">All movements</option><option value="debit">Debits</option><option value="credit">Credits</option></select>
        <select aria-label="Sort transactions" value={sort} onChange={e=>setSort(e.target.value as typeof sort)} className="h-14 bg-card px-4 text-xs font-semibold outline-none"><option value="recent">Most recent</option><option value="high">Amount high → low</option><option value="low">Amount low → high</option></select>
      </div>

      <div className="mt-9">
        {Object.entries(grouped).map(([month, rows]) => <section key={month} className="mb-10">
          <div className="mb-3 flex items-center justify-between"><h2 className="eyebrow">{month}</h2><p className="font-financial text-xs text-muted-foreground">{rows.length} records · {formatINR(rows.filter(r=>r.type==='debit').reduce((s,r)=>s+r.amount,0))} out</p></div>
          <div className="border-y hairline">
            {rows.map(t => <button key={t.id} onClick={()=>setSelected(t)} className="interactive-row grid w-full grid-cols-[42px_minmax(0,1fr)] gap-3 border-t first:border-t-0 hairline px-2 py-4 text-left md:grid-cols-[42px_minmax(0,1fr)_170px_130px] md:items-center">
              <span className={`grid h-9 w-9 place-items-center border ${t.anomaly ? 'border-[#b84f49]/30 bg-[#b84f49]/10 text-[#b84f49]' : t.type==='credit' ? 'border-[#2d7a65]/30 bg-[#2d7a65]/10 text-[#2d7a65]' : 'border-border bg-card text-muted-foreground'}`}>{t.type==='credit'?<ArrowDownLeft className="h-4 w-4"/>:<ArrowUpRight className="h-4 w-4"/>}</span>
              <div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{t.merchant}</span>{t.isRecurring&&<span className="text-[9px] uppercase tracking-wider text-muted-foreground">Recurring</span>}{t.anomaly&&<span className="text-[9px] font-bold uppercase tracking-wider text-[#b84f49]">Verify</span>}</div><p className="mt-1 text-xs text-muted-foreground">{t.description} · {t.date} at {t.time}</p></div>
              <p className={`col-start-2 text-xs md:col-start-auto ${t.anomaly ? 'text-[#b84f49]' : 'text-muted-foreground'}`}>{t.intelligence}</p>
              <p className={`font-financial col-start-2 text-left text-base md:col-start-auto md:text-right ${t.type==='credit'?'text-[#2d7a65]':''}`}>{t.type==='credit'?'+':'−'}{formatINR(t.amount)}</p>
            </button>)}
          </div>
        </section>)}
        {!filtered.length && <div className="surface py-20 text-center"><p className="text-lg font-medium">No transactions match those filters.</p><button onClick={()=>{setQuery('');setCategory('All');setType('all')}} className="mt-4 text-xs font-bold uppercase tracking-wider text-[#a46020]">Clear filters</button></div>}
      </div>
    </div>

    <AnimatePresence>{selected && <><motion.button aria-label="Close transaction detail" className="fixed inset-0 z-[60] bg-[#071a17]/45 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)} /><motion.aside role="dialog" aria-modal="true" className="fixed bottom-0 right-0 top-[72px] z-[61] w-full max-w-lg overflow-y-auto bg-[#f8f5ee] shadow-2xl" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:28,stiffness:260}}>
      <div className="flex items-center justify-between border-b hairline p-6"><div><p className="eyebrow">Transaction intelligence</p><p className="mt-2 text-xs text-muted-foreground">Trace ID {selected.id}</p></div><button onClick={()=>setSelected(null)} aria-label="Close"><X /></button></div>
      <div className="p-6 md:p-8"><p className="micro-label">{selected.type === 'credit' ? 'Money in' : 'Money out'}</p><p className="metric-value mt-4">{formatINR(selected.amount)}</p><h2 className="mt-7 text-2xl font-medium tracking-[-.04em]">{selected.merchant}</h2><p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>
        <dl className="mt-8 border-y hairline">{[['Date',selected.date],['Time',selected.time],['Category',selected.category],['Recurring',selected.isRecurring?'Yes':'No']].map(([a,b])=><div key={a} className="flex justify-between border-t first:border-t-0 hairline py-4 text-sm"><dt className="text-muted-foreground">{a}</dt><dd className="font-medium">{b}</dd></div>)}</dl>
        <div className={`mt-7 border-l-2 p-5 ${selected.anomaly?'border-[#b84f49] bg-[#b84f49]/8':'border-[#e88a34] bg-[#e88a34]/8'}`}><p className="micro-label">ARTHDRISHTI context</p><p className="mt-3 text-sm leading-6">{selected.intelligence}</p></div>
        <div className="mt-8"><p className="eyebrow">How it is used</p>{selected.insightIds?.length ? selected.insightIds.map(id=><div key={id} className="mt-4 flex items-center gap-3 border border-border bg-card p-4"><CheckCircle2 className="h-4 w-4 text-[#2d7a65]"/><span className="text-sm">Contributes to insight: <b>{id.replaceAll('-',' ')}</b></span></div>) : <p className="mt-4 text-sm text-muted-foreground">This transaction does not currently drive a material insight.</p>}</div>
      </div>
    </motion.aside></>}</AnimatePresence>
  </div>;
}
