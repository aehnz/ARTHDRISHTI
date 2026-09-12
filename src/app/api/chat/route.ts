import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextRequest } from 'next/server';

const anthropic = createAnthropic({
  baseURL: process.env.OPUSMAX_BASE_URL || 'https://api.opusmax.pro',
  apiKey: process.env.OPUSMAX_API_KEY || '',
});

const MODEL = process.env.OPUSMAX_MODEL || 'claude-sonnet-5';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context);

    const result = streamText({
      model: anthropic(MODEL),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      maxOutputTokens: 1024,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to process your request. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildSystemPrompt(context: any): string {
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

${context.governanceDecision ? `
DETERMINISTIC DECISION (DO NOT OVERRIDE):
Decision: ${context.governanceDecision.decision}
Reasoning:
${context.governanceDecision.reasoning.map((r: string) => `- ${r}`).join('\n')}
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
- Include specific numbers when relevant`;
}
