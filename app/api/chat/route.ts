import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { getMetricDefinitionPrompt } from '@/lib/ai/semantic-layer';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) console.error("Auth Error:", error);

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

    // Dynamically adjust System Prompt based on detailed state
    let systemPrompt = `
      You are the Prificient AI Financial Assistant.
      Your goal is to provide deterministic, accurate financial insights based STRICTLY on the data found in the database.
      
      CURRENT USER STATE: ${storeConnectionStatus}
    `;

    if (storeConnectionStatus === "NO_STORE_CONNECTED") {
      systemPrompt += `
        ⚠️ CRITICAL INSTRUCTION: NO STORE DETECTED ⚠️
        The user has NOT connected their Shopify store yet.
        1. INFORM the user politely that you cannot see any store.
        2. GUIDE them to connect their store: "Verilerinizi analiz edebilmem için önce mağazanızı bağlamanız gerekiyor."
        3. PROVIDE this specific link for them to click: [Mağaza Bağla](../connect/shopify)
        `;
    } else if (storeConnectionStatus === "CONNECTED_BUT_NO_DATA") {
      systemPrompt += `
        ⚠️ CRITICAL INSTRUCTION: STORE CONNECTED BUT EMPTY ⚠️
        The user has successfully connected their store, BUT the data synchronization is NOT complete yet (0 records found).
        1. ACKNOWLEDGE connection: "Mağaza bağlantınızı görüyorum, tebrikler."
        2. EXPLAIN missing data: "Ancak finansal verileriniz henüz tam olarak senkronize olmamış veya veritabanına düşmemiş."
        3. ADVICE: "Verilerin işlenmesi mağaza büyüklüğüne göre biraz zaman alabilir. Lütfen teknik ekibe durumu bildirin veya biraz bekleyin."
        4. DO NOT show the 'Connect Store' link again.
       `;
    } else {
      systemPrompt += `
        IDENTITY & RULES:
        1. Adhere to Double-Entry Bookkeeping principles. Revenue is generally Credit, Expenses are Debit.
        2. You currently DO NOT have access to live database tools (Maintenance Mode). 
           - If user asks for numbers, say: "Veritabanı bağlantısı şu an bakımda, ancak genel finansal sorularınızı yanıtlayabilirim."
        
        SEMANTIC LAYER (Metric Definitions):
        ${semanticContext}

        INTERACTION STYLE:
        - Be professional, concise, and helpful.
        `;
    }

    // Manual message normalization to bypass SDK schema validation issues
    const validMessages = messages.map((m: any) => {
      let content = m.content;

      // If content is missing but parts exist (typical in AI SDK UI for tool results), try to extract text
      if (!content && Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('\n');
      }

      // Fallback or ensure string
      if (typeof content !== 'string') {
        content = '';
      }

      // Only keep simple role/content to satisfy strict CoreMessage schema for text generation
      return {
        role: m.role,
        content: content
      };
    }).filter((m: any) => m.content.trim() !== '' || m.role === 'user');

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: validMessages,
      // tools: { ... } // Disabled for stability
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