import type { Language } from '@/types';
import { formatINR } from '@/data/intelligence';

export interface ChatContext {
  customerName: string;
  financialState: { monthlyIncome: number; existingEmi: number; savings: number; bufferMonths: number; cashFlowTrend: string; emiBurdenRatio: number; riskLevel: string; healthScore?: number; savingsRate?: number; monthlySurplus?: number };
  recentInsights: Array<{ title: string; type: string }>;
  language: string;
  loan?: { newEmi: number; projectedBurden: number; decision: string };
}

export const getFallbackResponse = (message: string, context: ChatContext): string => {
  const q=message.toLowerCase(); const f=context.financialState; const lang=context.language as Language;
  const loan=q.includes('loan')||q.includes('लोन')||q.includes('borrow')||q.includes('lakh');
  const spending=q.includes('spend')||q.includes('खर्च')||q.includes('khar');
  const saving=q.includes('save')||q.includes('saving')||q.includes('बचत')||q.includes('bachat')||q.includes('buffer');
  const healthy=(f.healthScore??64)>=80;
  if(loan){
    const decision=context.loan?.decision??(healthy?'RECOMMENDED WITH CAUTION':'NOT RECOMMENDED RIGHT NOW');
    if(lang==='hi') return `संक्षिप्त जवाब\n${decision === 'NOT RECOMMENDED RIGHT NOW' ? 'अभी ₹5 लाख का नया लोन लेना सही नहीं है।' : 'आपकी स्थिति मजबूत है, लेकिन पहले पूरा सिमुलेशन देखें।'}\n\nक्यों\nआपकी मौजूदा EMI ${formatINR(f.existingEmi)} है — आय का ${f.emiBurdenRatio}%। नया अनुमानित EMI ${formatINR(context.loan?.newEmi??11447)} होगा और कुल बोझ लगभग ${context.loan?.projectedBurden??52.4}% हो जाएगा।\n\nबेहतर विकल्प\n${healthy?'लक्ष्य और तरलता पर असर देखकर ही आगे बढ़ें।':'पहले 90-दिन का वित्तीय बफर बनाएं, फिर दोबारा आकलन करें।'}`;
    if(lang==='hinglish') return `SHORT ANSWER\n${decision === 'NOT RECOMMENDED RIGHT NOW' ? 'Abhi ₹5 lakh ka loan recommended nahi hai.' : 'Position strong hai, lekin full simulation pehle dekhein.'}\n\nKYUN\nExisting EMI ${formatINR(f.existingEmi)} hai — income ka ${f.emiBurdenRatio}%. Naya illustrative EMI ${formatINR(context.loan?.newEmi??11447)} hoga, aur total burden lagbhag ${context.loan?.projectedBurden??52.4}% ho jayega.\n\nBETTER ALTERNATIVE\n${healthy?'Goal aur liquidity impact ke saath decision lein.':'Pehle 90-day buffer build karein, phir reassess karein.'}`;
    return `SHORT ANSWER\n${decision}.\n\nWHY\nYour current EMIs are ${formatINR(f.existingEmi)}—${f.emiBurdenRatio}% of income. A ₹5 lakh simulation adds about ${formatINR(context.loan?.newEmi??11447)} a month and takes total burden to approximately ${context.loan?.projectedBurden??52.4}%.\n\nSIMULATED IMPACT\nCash flow is ${f.cashFlowTrend}; your buffer is ${f.bufferMonths} months. This is simulated affordability, not loan approval.\n\nBETTER ALTERNATIVE\n${healthy?'Inspect the goal and liquidity trade-off before deciding.':'Build the 90-day buffer, then reassess from a stronger position.'}`;
  }
  if(spending) return lang==='hi'?`आपके discretionary खर्च में सबसे बड़ा बदलाव food delivery और dining से आया है। संभावित बचत लगभग ₹4,800 प्रति माह है। “Transactions” में 12 आधार लेन-देन देख सकते हैं।`:lang==='hinglish'?`Sabse bada change food delivery aur dining mein hai. Potential saving lagbhag ₹4,800/month hai. Transactions mein 12 underlying records trace kar sakte ho.`:`The largest change is food delivery and dining. Together they create about ₹4,800 of potential monthly savings. Open Transactions to trace the insight to 12 underlying records.`;
  if(saving) return lang==='hi'?`आपका बफर ${f.bufferMonths} महीने है। तीन कदम: salary-day auto-transfer, unused subscription बंद करें, और food delivery सीमा तय करें।`:lang==='hinglish'?`Aapka buffer ${f.bufferMonths} months hai. Salary-day auto-transfer restore karo, unused subscription cancel karo, aur delivery limit set karo.`:`Your buffer is ${f.bufferMonths} months. The highest-impact sequence is: restore the salary-day transfer, cancel the low-use subscription, then set a weekly delivery guardrail.`;
  return lang==='hi'?`${context.customerName}, मैं आपके खर्च, बचत, कर्ज, लक्ष्य और सुरक्षा संकेतों को वर्तमान वित्तीय स्थिति से समझा सकता हूँ।`:lang==='hinglish'?`${context.customerName}, main current financial state use karke spending, savings, loan, goals aur protection explain kar sakta hoon.`:`${context.customerName}, I can explain spending, savings, loans, goals and protection using your current financial state. Try asking “Should I take a ₹5 lakh loan?”`;
};
