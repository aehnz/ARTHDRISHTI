'use client';

import { LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function ProfilePage() {
  const router = useRouter();
  const { auth, language, setLanguage, logout } = useApp();
  if (!auth) return null;
  return <div className="page-wrap py-10 md:py-16"><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><section className="surface-dark grid-rule p-8 text-white"><UserRound className="h-7 w-7 text-[#e88a34]"/><p className="eyebrow mt-12 !text-[#e88a34]">Profile</p><h1 className="mt-5 text-4xl font-medium tracking-[-.05em]">{auth.user.name}</h1><p className="mt-3 text-sm text-white/40">{auth.user.maskedPhone}</p><div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/45"><p>Secure session <b className="float-right text-white">Active</b></p><p className="mt-4">Onboarding <b className="float-right capitalize text-white">{auth.onboarding.status}</b></p></div></section><section className="surface p-7 md:p-10"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#2d7a65]"/><p className="eyebrow">Account preferences</p></div><h2 className="mt-6 text-3xl font-medium tracking-[-.045em]">Language and session</h2><p className="mt-3 text-sm text-muted-foreground">Your language preference is stored against your authenticated profile.</p><div className="mt-8 grid gap-3 sm:grid-cols-3">{(['en','hi','hinglish'] as const).map(item=><button key={item} onClick={()=>setLanguage(item)} className={`border p-4 text-left text-sm ${language===item?'border-[#e88a34] bg-[#e88a34]/8':'border-border'}`}>{item==='en'?'English':item==='hi'?'हिंदी':'Hinglish'}</button>)}</div><button onClick={()=>void logout().then(()=>router.push('/'))} className="mt-10 inline-flex items-center gap-3 border border-border px-5 py-3 text-xs font-bold uppercase tracking-wider"><LogOut className="h-4 w-4"/>Sign out</button></section></div></div>;
}
