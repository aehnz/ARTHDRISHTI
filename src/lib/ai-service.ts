// ============================================
// ARTHDRISHTI - AI Service (OpusMax)
// ============================================

import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const anthropic = createAnthropic({
  baseURL: process.env.OPUSMAX_BASE_URL || 'https://api.opusmax.pro',
  apiKey: process.env.OPUSMAX_API_KEY || '',
});

const MODEL = process.env.OPUSMAX_MODEL || 'claude-sonnet-5';

export interface ChatContext {
  customerName: string;
  financialState: {
    monthlyIncome: number;
    existingEmi: number;
    savings: number;
    bufferMonths: number;
    cashFlowTrend: string;
    emiBurdenRatio: number;
    riskLevel: string;
  };
  recentInsights: Array<{ title: string; type: string }>;
  language: string;
  governanceDecision?: {
    decision: string;
    reasoning: string[];
  };
}

const buildSystemPrompt = (context: ChatContext): string => {
  return `You are ARTHDRISHTI's financial communication assistant.

CRITICAL RULES:
1. You are a conversational assistant. You do NOT make financial decisions.
2. The deterministic financial/governance engine makes all decisions.
3. You explain decisions in plain, empathetic language.
4. Never fabricate customer data. Only use the context provided.
5. Never claim certainty where uncertain.
6. Never override deterministic governance decisions.
7. Never use manipulative sales language.
8. Never pressure the customer.
9. Support English, Hindi, and Hinglish naturally based on the user's input language.
10. Distinguish between: insight, recommendation, eligibility, and approval.

CUSTOMER CONTEXT:
- Name: ${context.customerName}
- Monthly Income: ₹${context.financialState.monthlyIncome.toLocaleString('en-IN')}
- Existing EMI: ₹${context.financialState.existingEmi.toLocaleString('en-IN')}/month (${context.financialState.emiBurdenRatio}% of income)
- Savings: ₹${context.financialState.savings.toLocaleString('en-IN')}
- Financial Buffer: ${context.financialState.bufferMonths} months
- Cash Flow Trend: ${context.financialState.cashFlowTrend}
- Risk Level: ${context.financialState.riskLevel}

RECENT INSIGHTS:
${context.recentInsights.map(i => `- ${i.title} (${i.type})`).join('\n')}

${context.governanceDecision ? `
DETERMINISTIC DECISION (DO NOT OVERRIDE):
Decision: ${context.governanceDecision.decision}
Reasoning:
${context.governanceDecision.reasoning.map(r => `- ${r}`).join('\n')}

Explain this decision empathetically. Do not contradict it.
` : ''}

TONE:
- Calm, human, non-judgmental
- Clear financial explanations in plain language
- Supportive, not sales-oriented
- Use Indian financial context (₹, lakhs, months)
- When customer writes in Hindi/Hinglish, respond naturally in Hindi/Hinglish

RESPONSE STYLE:
- Keep responses focused and actionable
- Use bullet points for clarity
- Offer practical next steps
- Never say "AI decided this" — say "ARTHDRISHTI assessed..."
- Include specific numbers when relevant
- Keep responses under 200 words unless detailed explanation is requested`;
};

export const getFallbackResponse = (userMessage: string, context: ChatContext): string => {
  const lower = userMessage.toLowerCase();

  if (lower.includes('loan') || lower.includes('लोन') || lower.includes('借') || lower.includes('借') || lower.includes('借り')) {
    return context.language === 'hi'
      ? `आपके वर्तमान वित्तीय स्थिति के आधार पर, ARTHDRISHTI का मूल्यांकन है: अभी नया लोन अनुशंसित नहीं है। आपका EMI बोझ पहले ही 38.4% है और आपका वित्तीय बफर 2.4 महीने है। पहले अपना बफर मजबूत करें।`
      : context.language === 'hinglish'
      ? `Aapki current financial situation ke aadhar pe, ARTHDRISHTI ka assessment hai: RIGHT NOW NOT RECOMMENDED. Aapka EMI burden already 38.4% hai aur buffer 2.4 months hai. Pehle apna 90-day buffer build karo.`
      : `Based on your current financial context, ARTHDRISHTI's assessment is: NOT RECOMMENDED RIGHT NOW.

Your existing EMI burden is ₹31,500/month (38.4% of income) and your financial buffer has tightened to 2.4 months. Taking on additional debt right now could reduce your financial resilience.

Better next step: Build your 90-day financial buffer first. This will strengthen your position for future financial decisions.`;
  }

  if (lower.includes('spending') || lower.includes('kharch') || lower.includes('खर्च') || lower.includes('kharche')) {
    return context.language === 'hi'
      ? `आपके खर्च का विश्लेषण: मुक्तपेंपुर्स खर्च में 11% की वृद्धि हुई है। सबसे बड़ा कारक खाना और बाहर खाना है।`
      : context.language === 'hinglish'
      ? `Spending analysis: Discretionary spending mein 11% increase hua hai. Sabse badi increase food aur dining mein hai.`
      : `ARTHDRISHTI's analysis of your spending:

Your discretionary spending increased 11% over the last 30 days. The biggest driver is food and dining (+18%).

Potential savings: ₹4,000-5,000/month by reducing delivery orders.

Your total monthly spending: ₹76,000 (essential: ₹41,800, discretionary: ₹34,200)`;
  }

  if (lower.includes('save') || lower.includes('बचत') || lower.includes('bachat') || lower.includes('save karna')) {
    return context.language === 'hi'
      ? `बचत सुधार के लिए सुझाव: 1) फूड डिलीवरी कम करें 2) बिना उपयोग की सदस्यताएं रद्द करें 3) सैलरी के दिन ऑटो-ट्रांसफर सेट करें`
      : context.language === 'hinglish'
      ? `Savings improve karne ke liye: 1) Food delivery kam karo 2) Unused subscriptions cancel karo 3) Salary day pe auto-transfer set karo`
      : `Here's how you can improve your savings:

1. Reduce food delivery by 3-4 orders/week = ₹4,000-5,000/month
2. Cancel unused subscriptions = ₹1,000-2,000/month
3. Set up auto-transfer on salary day

Total potential savings: ₹6,000-8,000/month

Want me to create a 30-day savings plan?`;
  }

  if (lower.includes('buffer') || lower.includes('बफर') || lower.includes('financial health') || lower.includes('स्वास्थ्य')) {
    return context.language === 'hi'
      ? `आपका वित्तीय बफर 2.4 महीने का है, जो 3 महीने की सिफारिश से कम है। यह आपकी आय और मौसमिक खर्च के आधार पर गणना किया गया है।`
      : context.language === 'hinglish'
      ? `Aapka financial buffer 2.4 months ka hai, jo 3 months ki recommendation se kam hai. Ye aapki income aur monthly expenses ke aadhar pe calculate hua hai.`
      : `Your financial buffer analysis:

- Current: 2.4 months of essential expenses
- Recommended minimum: 3 months
- Change: -0.8 months over 8 weeks

This means you have less cushion for unexpected expenses than recommended. The decline is driven by:
1. Discretionary spending +11%
2. Savings rate -8%
3. Delayed savings transfer

Target: Build buffer back to 3-4 months.`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey') || lower.includes('namaste') || lower.includes('नमस्ते')) {
    return context.language === 'hi'
      ? `नमस्ते ${context.customerName}! मैं ARTHDRISHTI हूं, आपका वित्तीय सहायक। आप मुझसे अपने खर्च, बचत, कर्ज या किसी भी वित्तीय प्रश्न के बारे में पूछ सकते हैं।`
      : context.language === 'hinglish'
      ? `Namaste ${context.customerName}! Main ARTHDRISHTI hoon, aapka financial assistant. Aap mujhse apne spending, savings, debt ya kisi financial baare mein pooch sakte ho.`
      : `Hello ${context.customerName}! I'm ARTHDRISHTI, your financial assistant.

I can help you understand:
- Your spending patterns and where money is going
- Your savings and financial buffer
- Debt and EMI analysis
- Personalized financial recommendations

What would you like to know about your financial life?`;
  }

  if (lower.includes('protect') || lower.includes('fraud') || lower.includes('सुरक्षा') || lower.includes('suraksha')) {
    return context.language === 'hi'
      ? `ARTHDRISHTI आपकी सुरक्षा के लिए यहां है। हम आपके लेन-देन के पैटर्न की निगरानी करते हैं और असामान्य गतिविधि के बारे में सूचित करते हैं। आपकी सुरक्षा हमारी प्राथमिकता है।`
      : context.language === 'hinglish'
      ? `ARTHDRISHTI yahan hai aapki protection ke liye. Hum aapke transaction patterns ko monitor karte hain aur unusual activity ke baare mein alert karte hain.`
      : `ARTHDRISHTI is here to help protect you:

We monitor your transaction patterns and alert you to potentially unusual activity. Your protection is our priority.

I noticed one potential anomaly recently:
- ₹18,450 online transaction at 11:48 PM
- Unusual merchant pattern

Would you like me to show you the details?`;
  }

  // Default
  return context.language === 'hi'
    ? `आपके प्रश्न के बारे में मुझसे अधिक जानने के लिए कहें। आप अपने खर्च, बचत, कर्ज, वित्तीय स्वास्थ्य या लोन के बारे में पूछ सकते हैं।`
    : context.language === 'hinglish'
    ? `Aap apne spending, savings, debt, financial health ya loan ke baare mein mujhse kuch bhi pooch sakte ho. Main help karunga.`
    : `I'd love to help with that. You can ask me about:

- Your spending patterns and where money is going
- Your savings and how to improve them
- Your debt and EMI situation
- Loan decisions and why they matter
- Your overall financial health

What's on your mind?`;
};
