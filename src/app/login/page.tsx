'use client';

import { ArrowLeft, ArrowRight, LockKeyhole, Smartphone, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import type { DemoAccount } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useApp();
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState<{ id: string; masked: string } | null>(null);
  const [otp, setOtp] = useState('');
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function start(loginPhone = phone, presetOtp = '') {
    setLoading(true); setError('');
    try {
      const result = await api.startAuth(loginPhone);
      setPhone(loginPhone); setOtp(presetOtp); setChallenge({ id: result.challenge_id, masked: result.masked_phone });
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start verification.'); }
    finally { setLoading(false); }
  }

  async function exploreAccounts() {
    setShowAccounts(true); setError('');
    if (accounts.length) return;
    setLoading(true);
    try { setAccounts(await api.demoCatalog()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load demo accounts.'); }
    finally { setLoading(false); }
  }

  async function chooseAccount(account: DemoAccount) {
    setSelectedAccount(account.displayName); setShowAccounts(false);
    await start(account.phone, account.otp);
  }

  async function verify() {
    if (!challenge) return;
    setLoading(true); setError('');
    try { await api.verifyAuth(challenge.id, otp); const context = await refreshSession(); router.push(context?.onboarding.status === 'complete' ? '/dashboard' : '/onboarding'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to verify the code.'); }
    finally { setLoading(false); }
  }

  return <div className="grid min-h-[calc(100svh-72px)] bg-[#071a17] text-[#fffaf0] lg:grid-cols-[.48fr_.52fr]">
    <aside className="noise grid-rule hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between"><div><p className="eyebrow !text-[#e88a34]">Secure access</p><h1 className="mt-8 max-w-xl text-6xl font-medium leading-[.95] tracking-[-.065em]">Your financial life stays attached to your session.</h1></div><div className="flex max-w-md gap-4 border-l-2 border-[#e88a34] pl-5"><LockKeyhole className="h-5 w-5 shrink-0 text-[#e88a34]"/><p className="text-sm leading-6 text-white/42">One-time verification keeps each financial profile bound to its authenticated account.</p></div></aside>
    <section className="flex items-center justify-center p-6 md:p-12"><div className={`w-full ${showAccounts?'max-w-2xl':'max-w-lg'}`}><div className="flex flex-col items-start gap-2"><Smartphone className="h-10 w-10 text-[#e88a34]"/><p className="eyebrow !text-[#e88a34]">{showAccounts ? 'Explore Demo Accounts' : challenge ? 'Verify your number' : 'Sign in'}</p></div><h2 className="mt-5 text-5xl font-medium tracking-[-.055em]">{showAccounts ? 'Choose a financial situation.' : challenge ? 'Enter the one-time code.' : 'Welcome back.'}</h2><p className="mt-5 text-sm leading-6 text-white/42">{showAccounts ? 'Each account opens the same ARTHDRISHTI experience with a fixed, pre-seeded financial state.' : challenge ? `A one-time code was issued for ${challenge.masked}.` : 'Use your registered Indian mobile number.'}</p>
      {showAccounts ? <div className="mt-8"><div className="grid max-h-[48vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{accounts.map(account=><button key={account.accountId} disabled={loading} onClick={()=>void chooseAccount(account)} className="border border-white/12 p-4 text-left transition hover:border-[#e88a34]/60 hover:bg-white/[.04]"><span className="block text-sm font-semibold">{account.displayName}</span><span className="mt-2 block text-[11px] leading-5 text-white/38">{account.situation}</span></button>)}</div>{loading&&<p className="mt-5 text-xs text-white/35">Loading available accounts…</p>}<button onClick={()=>setShowAccounts(false)} className="mt-6 flex items-center gap-2 text-xs text-white/45"><ArrowLeft className="h-4 w-4"/>Back to sign in</button></div> : !challenge ? <label className="mt-10 block"><span className="micro-label !text-white/30">Mobile number</span><input aria-label="Mobile number" value={phone} onChange={event=>setPhone(event.target.value)} className="mt-3 w-full border border-white/15 bg-transparent p-4 font-financial outline-none focus:border-[#e88a34]"/><button disabled={loading} onClick={()=>void start()} className="primary-action mt-6">{loading ? 'Starting…' : 'Send OTP'}<ArrowRight className="h-4 w-4"/></button></label> : <div className="mt-10"><label className="block"><span className="micro-label !text-white/30">One-time password</span><input value={otp} onChange={event=>setOtp(event.target.value)} inputMode="numeric" maxLength={6} className="mt-3 w-full border border-white/15 bg-transparent p-4 font-financial tracking-[.55em] outline-none focus:border-[#e88a34]"/></label><p className="mt-3 text-[10px] text-white/28">{selectedAccount ? `${selectedAccount} access details are ready.` : 'Enter the verification code for this account.'}</p><div className="mt-6 flex items-center justify-between"><button onClick={()=>{setChallenge(null);setOtp('');setSelectedAccount(null)}} className="flex items-center gap-2 text-xs text-white/45"><ArrowLeft className="h-4 w-4"/>Change number</button><button disabled={loading} onClick={verify} className="primary-action">{loading ? 'Verifying…' : 'Verify and continue'}<ArrowRight className="h-4 w-4"/></button></div></div>}
      {error && <p role="alert" className="mt-5 text-sm text-[#e98a7e]">{error}</p>}
      {!showAccounts&&!challenge&&<div className="mt-12 border-t border-white/10 pt-7"><p className="text-xs text-white/35">Want to explore a pre-seeded financial journey?</p><button onClick={()=>void exploreAccounts()} className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e88a34]"><UsersRound className="h-4 w-4"/>Explore Demo Accounts →</button></div>}<Link href="/" className="mt-8 inline-block text-xs text-white/35">← Back to ARTHDRISHTI</Link></div></section>
    <style jsx global>{`.primary-action{display:inline-flex;align-items:center;gap:.75rem;background:#e88a34;color:#10211d;padding:.9rem 1.25rem;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.primary-action:disabled{opacity:.55}`}</style>
  </div>;
}
