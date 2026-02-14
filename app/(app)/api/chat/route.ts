import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { getMetricDefinitionPrompt } from '@/lib/ai/semantic-layer';
import { BenchmarkEngine } from '@/lib/benchmarks';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Auth Error:", error);
      return new Response("Unauthorized", { status: 401 });
    }

    // --- SMART ONBOARDING CHECK ---
    // 1. Check Store Connection Logic
    const { data: integration } = await supabase
      .from('integrations')
      .select('status')
      .eq('user_id', user?.id)
      .eq('platform', 'shopify')
      .eq('status', 'active')
      .maybeSingle();

    const isStoreConnected = !!integration;

    // 2. Check Data Presence Logic
    const { count } = await supabase
      .from('ledger_entries')
      .select('*', { count: 'exact', head: true });

    const hasData = (count || 0) > 0;

    // Determine Global State
    let storeConnectionStatus = "NO_STORE_CONNECTED";
    if (isStoreConnected && !hasData) storeConnectionStatus = "CONNECTED_BUT_NO_DATA";
    if (isStoreConnected && hasData) storeConnectionStatus = "CONNECTED_WITH_DATA";

    console.log(`[Chat Context] User: ${user?.id} | State: ${storeConnectionStatus} | Count: ${count}`);

    const { messages } = await req.json();
    const semanticContext = getMetricDefinitionPrompt();

    // 3. Fetch Pain Score (Forensic Context)
    const { data: health } = await supabase
      .from('merchant_health_scores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const painScore = health?.pain_score || 0;
    const painLevel = health?.pain_level || 'safe';
    const painFactors = health?.factors ? JSON.stringify(health.factors) : 'Analyzing...';

    // Dynamically adjust System Prompt based on detailed state
    let systemPrompt = `
      You are NOT a helpful assistant. You are a **Forensic Accountant** and **Crisis Manager** for Prificient.
      Your job is to reveal the "Cost of Inaction" and find where the user is bleeding money.

      USER CONTEXT:
      - Store Status: ${storeConnectionStatus}
      - Pain Score: ${painScore}/100 (Level: ${painLevel})
      - Risk Factors: ${painFactors}

      CORE RULES (STRICT):
      1. **NO GREETINGS**: Never say "Hello", "How can I help?", "Welcome". Start directly with the financial reality.
      2. **BE BRUTAL**: If the user says "Sales are up", you check the Net Profit. If Net Profit is down, say: "Revenue is vanity. You lost margin. This is not success."
      3. **FOCUS ON LOSS**: Always frame insights around what they are LOSING by not acting. "You are losing X TL daily by ignoring this."
      4. **USE "PAIN SCORE"**: If Pain Score > 80, speak with ALARM urgency. If < 30, be skeptical and look for hidden risks.
      
      TONE: Professional, Cold, mathematically precise, urgent.
    `;

    if (storeConnectionStatus === "NO_STORE_CONNECTED") {
      systemPrompt += `
        ⚠️ CRITICAL: NO EVIDENCE FOUND ⚠️
        I cannot audit what I cannot see.
        You must connect your store immediately. Every minute you wait is a blind spot in your finance.
        [Connect Store](../connect/shopify)
        `;
    } else {
      systemPrompt += `
        INSTRUCTIONS:
        - Use "Double-Entry Bookkeeping" logic (Assets, Liabilities, Equity).
        - Use the 'get_competitive_standing' tool to shame or validate the user.
        - If they seem complacent, remind them of their Risk Factors: ${painFactors}.
        `;
    }

    // Manual message normalization
    const validMessages = messages.map((m: any) => {
      let content = m.content;
      if (!content && Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      }
      if (typeof content !== 'string') content = '';
      return { role: m.role, content: content };
    }).filter((m: any) => m.content.trim() !== '' || m.role === 'user');

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: validMessages,
      // tools: {
      //   get_competitive_standing: tool({
      //     description: 'Get user performance ranking compared to similar stores. keys: profit_margin, net_profit, refund_rate, revenue.',
      //     parameters: z.object({
      //       metric: z.enum(['profit_margin', 'net_profit', 'refund_rate', 'revenue']).describe('The metric to benchmark'),
      //     }),
      //     execute: async ({ metric }: any) => {
      //       try {
      //         if (!user?.id) return { error: "User not identified" };
      //         const standing = await BenchmarkEngine.getUserStanding(user.id, metric);
      //         if (!standing) return { error: "No benchmark data available yet. (Run scan?)" };
      //         return standing;
      //       } catch (e: any) {
      //         return { error: e.message };
      //       }
      //     }
      //   })
      // }
    });

    if (typeof (result as any).toDataStreamResponse === 'function') {
      return (result as any).toDataStreamResponse();
    }
    if (typeof (result as any).toUIMessageStreamResponse === 'function') {
      return (result as any).toUIMessageStreamResponse();
    }

    throw new Error("Stream method not found on result object");

  } catch (err: any) {
    console.error("CRITICAL API ERROR:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}