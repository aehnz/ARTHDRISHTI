'use client';

import { ArrowDown, CalendarClock, CheckCircle2, Clock3 } from 'lucide-react';
import { PageHeader } from '@/components/FinancialVisuals';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/format';

export default function CashFlowPage() {
  const { demoState } = useApp();
  const cash=demoState.cashFlow;
  const flow=[
    ['Income',cash.expectedIncome,'#2d7a65'],['Fixed obligations',cash.recurringExpenses,'#173d34'],
    ['Discretionary',cash.discretionarySpending,'#e88a34'],['Monthly headroom',cash.monthlyHeadroom,cash.pressureLevel==='tight'?'#b84f49':'#2d7a65'],
  ] as const;
  const events=cash.next30Days.map(event=>[event.date.slice(-2),event.label,event.amount,event.type==='income'?'in':'out',event.recurring?'Recurring':'Expected'] as const);
  return <div>
    <PageHeader eyebrow="Money · Cash flow" title="Know when money gets tight—not only where it went." description={`${formatINR(cash.upcomingObligations)} of recurring obligations are expected in the next 10 days.`} aside={<div className={`border px-4 py-3 text-xs font-bold uppercase tracking-wider ${cash.pressureLevel==='tight'?'border-[#b84f49]/30 bg-[#b84f49]/10 text-[#b84f49]':'border-[#2d7a65]/30 bg-[#2d7a65]/10 text-[#2d7a65]'}`}>{cash.trend} trend</div>} />
    <section className="surface-dark grid-rule py-12"><div className="page-wrap">
      <div className="mb-8 flex items-end justify-between"><div><p className="eyebrow !text-[#e88a34]">Monthly money flow</p><h2 className="mt-3 text-3xl font-medium tracking-[-.045em]">Income → obligations → choices → savings</h2></div><p className="hidden max-w-sm text-right text-xs leading-5 text-white/35 md:block">Widths are proportional to income. Debt remains separate from day-to-day spending.</p></div>
      <div className="grid items-end gap-3 md:grid-cols-4">
        {flow.map(([label,value,color],i)=><div key={label} className="relative"><div className="flex items-end justify-between gap-3 border-b border-white/10 pb-3"><span className="text-xs text-white/48">{label}</span><span className="font-financial text-lg">{formatINR(value)}</span></div><div className="mt-4 flex h-36 items-end bg-white/[.035]"><div className="w-full" style={{height:`${Math.max(7,Math.abs(value)/cash.expectedIncome*100)}%`,background:color}} /></div>{i<3&&<ArrowDown className="absolute -right-5 top-1/2 z-10 hidden h-4 w-4 -rotate-90 text-[#e88a34] md:block"/>}</div>)}
      </div>
    </div></section>
    <section className="page-section"><div className="page-wrap grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
      <div><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">{cash.periodLabel}</p><h2 className="mt-3 text-2xl font-medium tracking-[-.04em]">Recurring commitments</h2></div><CalendarClock className="h-6 w-6 text-[#e88a34]"/></div><div className="border-y hairline">{events.map(([day,label,amount,type,status])=><div key={String(day)+label} className="grid grid-cols-[38px_minmax(0,1fr)] items-center gap-4 border-b last:border-b-0 hairline py-4 sm:grid-cols-[46px_minmax(0,1fr)_auto]"><span className="font-financial text-2xl text-muted-foreground">{day}</span><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{status}</p></div><span className={`font-financial col-start-2 text-sm sm:col-start-auto ${type==='in'?'text-[#2d7a65]':''}`}>{type==='in'?'+':'−'}{formatINR(Number(amount))}</span></div>)}</div></div>
      <aside className="space-y-4"><div className="border-l-2 border-[#e88a34] bg-[#e9e3d8] p-7"><Clock3 className="h-5 w-5 text-[#a46020]"/><p className="eyebrow mt-6">Pressure window</p><p className="font-financial mt-4 text-4xl">{formatINR(cash.upcomingObligations)}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">will leave the account before the next flexible spending window.</p></div><div className="surface p-6"><p className="eyebrow">Expected payments</p><div className="mt-5 space-y-3">{['Salary pattern recognized','Three EMI dates mapped','Rent and utilities expected','Subscription review available'].map(x=><p key={x} className="flex items-center gap-3 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-[#2d7a65]"/>{x}</p>)}</div></div></aside>
    </div></section>
  </div>;
}
