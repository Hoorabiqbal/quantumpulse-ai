// src/services/groqService.ts

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting for Groq (30 requests per minute free tier)
let groqRequestTimestamps: number[] = [];
const GROQ_MAX_PER_MINUTE = 30;
const GROQ_WINDOW_MS = 60000;

function canMakeGroqRequest(): boolean {
  const now = Date.now();
  groqRequestTimestamps = groqRequestTimestamps.filter(ts => now - ts < GROQ_WINDOW_MS);
  return groqRequestTimestamps.length < GROQ_MAX_PER_MINUTE;
}

function addGroqRequestTimestamp(): void {
  groqRequestTimestamps.push(Date.now());
}

function getGroqWaitTime(): number {
  if (canMakeGroqRequest()) return 0;
  const now = Date.now();
  const oldestRequest = Math.min(...groqRequestTimestamps);
  return Math.max(0, GROQ_WINDOW_MS - (now - oldestRequest));
}

// Helper function to clean and extract JSON from response
function extractJSON(text: string): any {
  let cleaned = text.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');

  // Extract outermost JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // First attempt: direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Second attempt: fix trailing commas
  try {
    const fixed = cleaned.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(fixed);
  } catch (_) {}

  // Third attempt: fix unquoted property names and single quotes
  try {
    let fixed2 = cleaned
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"')            // single → double quoted values
      .replace(/,(\s*[}\]])/g, '$1');                 // trailing commas
    return JSON.parse(fixed2);
  } catch (_) {}

  // Last resort: try to extract answer field from malformed response
  const answerMatch = cleaned.match(/answer["'\s:]+([^"'\n]{5,})/i);
  if (answerMatch?.[1]) {
    return { answer: answerMatch[1].replace(/[",]+$/, '').trim(), confidence: 70, sector: "General" };
  }

  throw new Error("No valid JSON found in Groq response");
}

function buildIntelligentPrompt(text: string): string {
  return `You are a world-class financial market analyst with deep expertise in macroeconomics, geopolitics, and global markets.

Analyze this news with professional, nuanced insight:

NEWS: "${text}"

YOUR TASK: Provide a comprehensive market impact analysis. Think like a hedge fund analyst.

REQUIRED OUTPUT FORMAT (STRICT JSON):

{
  "overallSentiment": "Bullish/Bearish/Neutral",
  "summary": "2-3 sentence professional overview of the news and its significance",
  "marketImpacts": [
    {
      "market": "US Stocks",
      "sentiment": "Bullish/Bearish/Neutral",
      "impact": "Specific directional impact explanation",
      "reasoning": "Why this market is affected (max 15 words)"
    }
  ],
  "narrative": "A professional, human-like analysis (4-6 sentences) explaining the broader implications, risks and opportunities"
}

MARKETS TO CONSIDER (ONLY INCLUDE RELEVANT ONES):
- US Stocks (S&P 500, Nasdaq, Dow)
- Tech Sector
- Banking/Financials
- Energy/Oil
- Gold/Precious Metals
- Crypto (Bitcoin, Ethereum)
- US Dollar (DXY)
- Bonds/Treasuries
- Global Markets (if applicable)
- Specific Sectors (based on news context)

ANALYSIS RULES:
1. Be SPECIFIC, not generic
2. Understand CONTEXT: War = oil up, risk assets down, safe havens up
3. Differentiate between SHORT-TERM and LONG-TERM impacts when relevant
4. For REGULATORY news, focus only on affected sectors
5. For GEOPOLITICAL events, analyze safe havens vs risk assets
6. For ECONOMIC data, connect to Fed policy, inflation, growth expectations

CRITICAL: Only include markets ACTUALLY impacted. Be intelligent about market interconnections.

Respond with ONLY the JSON object. No markdown, no extra text.`;
}

function buildQuestionPrompt(question: string): string {
  return `You are a financial expert. Answer this question with clear, specific, and insightful analysis.

QUESTION: "${question}"

REQUIRED OUTPUT FORMAT (STRICT JSON):

{
  "answer": "Your clear, detailed answer (2-4 sentences, be specific and include directional impact if applicable)",
  "confidence": 85,
  "sector": "The main sector this relates to (Crypto, Stocks, Economics, etc.)"
}

RULES:
- For crypto questions: Explain what it is, how it works, and its market significance
- For market questions: Include directional impact and reasoning
- Be specific, not generic
- Keep it professional but accessible

Respond with ONLY the JSON object. No markdown, no extra text.`;
}

// FIX: Groq no longer returns a "soft failure" object on error.
// It now THROWS so that geminiService.ts can fall through to the deterministic fallback.
// This prevents Groq's own silent failure from masking a perfectly valid analysis.
export async function analyzeWithGroq(text: string, isQuestion: boolean): Promise<any> {
  // Wait if rate limited
  if (!canMakeGroqRequest()) {
    const waitTime = getGroqWaitTime();
    console.log(`⏳ Groq rate limited, waiting ${Math.ceil(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  if (!GROQ_API_KEY) {
    throw new Error("Missing Groq API key");
  }

  const prompt = isQuestion ? buildQuestionPrompt(text) : buildIntelligentPrompt(text);

  console.log(`🚀 Making Groq API request... (${GROQ_MAX_PER_MINUTE - groqRequestTimestamps.length} left this minute)`);

  // FIX: Retry Groq up to 2 times before throwing
  let lastError: any;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a world-class financial analyst. Respond ONLY with valid JSON. Follow the format exactly. Do not include any markdown or explanation outside the JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      addGroqRequestTimestamp();

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in Groq response");
      }

      // Use enhanced JSON extraction
      const result = extractJSON(content);
      console.log("✅ Groq analysis successful");
      return result;

    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err;
      console.error(`❌ Groq attempt ${attempt + 1} failed:`, err.message);
      if (attempt < 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  // THROW instead of returning a soft-failure object — lets geminiService fall to deterministic fallback
  throw lastError || new Error("Groq analysis failed after retries");
}

export function getGroqStatus() {
  const now = Date.now();
  groqRequestTimestamps = groqRequestTimestamps.filter(ts => now - ts < GROQ_WINDOW_MS);
  return {
    remainingThisMinute: GROQ_MAX_PER_MINUTE - groqRequestTimestamps.length,
    maxPerMinute: GROQ_MAX_PER_MINUTE,
  };
}
