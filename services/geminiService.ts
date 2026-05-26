import { analyzeWithGroq } from './groqService';
import { processUserQuery, generateResponsePrompt } from './intelligenceService';

/**
 * ULTRA-INTELLIGENT FINANCIAL MARKET ANALYZER
 *
 * Fixes applied:
 * 1. isNewsAnalysis logic was too strict — news without question marks but < 5 words failed silently
 * 2. Final fallback returned `intent: "irrelevant"` for valid news — now returns proper sentiment
 * 3. Groq fallback error was swallowed silently — now properly re-throws or uses deterministic fallback
 * 4. JSON parsing didn't handle all Gemini response edge cases
 * 5. Retry logic: Gemini retries 3 times before falling to Groq; Groq retries 2 times before deterministic fallback
 */

// ========== CONFIGURATION ==========
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_REQUESTS_PER_DAY = 250;
const REQUEST_WINDOW_MS = 60000;
let requestTimestamps: number[] = [];
let totalRequestsToday = 0;
let dailyResetTime = new Date();
dailyResetTime.setHours(24, 0, 0, 0);

let isProcessingQueue = false;
const requestQueue: Array<{
  prompt: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
}> = [];

// ========== RATE LIMIT HELPERS ==========
function getRemainingRequests(): number {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < REQUEST_WINDOW_MS);
  return Math.max(0, MAX_REQUESTS_PER_MINUTE - requestTimestamps.length);
}

function getRemainingToday(): number {
  return Math.max(0, MAX_REQUESTS_PER_DAY - totalRequestsToday);
}

function getTimeUntilDailyReset(): number {
  const now = Date.now();
  const timeUntilMidnight = dailyResetTime.getTime() - now;
  return Math.max(0, Math.ceil(timeUntilMidnight / 1000));
}

function canMakeRequest(): boolean {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < REQUEST_WINDOW_MS);
  return requestTimestamps.length < MAX_REQUESTS_PER_MINUTE &&
    totalRequestsToday < MAX_REQUESTS_PER_DAY;
}

function addRequestTimestamp(): void {
  requestTimestamps.push(Date.now());
  totalRequestsToday++;
}

function getWaitTime(): number {
  if (canMakeRequest()) return 0;
  const now = Date.now();
  if (totalRequestsToday >= MAX_REQUESTS_PER_DAY) {
    return Math.max(0, dailyResetTime.getTime() - now);
  }
  const oldestRequest = Math.min(...requestTimestamps);
  return Math.max(0, REQUEST_WINDOW_MS - (now - oldestRequest));
}

function logRateLimitStatus(): void {
  console.log(`📊 Gemini: ${getRemainingRequests()}/${MAX_REQUESTS_PER_MINUTE} left this minute`);
  console.log(`📊 Daily: ${getRemainingToday()}/${MAX_REQUESTS_PER_DAY} left today`);
}

function checkDailyReset(): void {
  const now = Date.now();
  if (now >= dailyResetTime.getTime()) {
    console.log(`🔄 Daily reset! Used ${totalRequestsToday} requests`);
    totalRequestsToday = 0;
    dailyResetTime = new Date();
    dailyResetTime.setHours(24, 0, 0, 0);
  }
}

// ========== API EXECUTION ==========
async function executeGeminiRequest(prompt: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) throw new Error("Missing Gemini API key");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text in response");
    return text.trim();

  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("Request timeout");
    throw err;
  }
}

// FIX: Increased retries from 2 → 3 for Gemini
async function callGeminiAPI(prompt: string, retries = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    requestQueue.push({ prompt, resolve, reject, retries });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    checkDailyReset();

    if (!canMakeRequest()) {
      const waitTime = getWaitTime();
      if (waitTime > 0) {
        console.log(`⏳ Waiting ${Math.ceil(waitTime / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      continue;
    }

    const next = requestQueue.shift();
    if (next) {
      try {
        console.log(`📡 Making Gemini API request... (${getRemainingRequests()} left this minute)`);
        addRequestTimestamp();
        const result = await executeGeminiRequest(next.prompt);
        logRateLimitStatus();
        next.resolve(result);
      } catch (error) {
        if (next.retries > 0) {
          console.log(`🔁 Retrying Gemini... (${next.retries} retries left)`);
          requestQueue.unshift({ ...next, retries: next.retries - 1 });
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          next.reject(error);
        }
      }
    }
  }
  isProcessingQueue = false;
}

// ========== ULTRA-INTELLIGENT ANALYSIS PROMPT ==========
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
  "narrative": "A professional, human-like analysis (4-6 sentences) explaining the broader implications, risks, and opportunities"
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
1. Be SPECIFIC, not generic. "Rate cuts" affect stocks positively, dollar negatively, bonds positively
2. Understand CONTEXT: War = oil up, risk assets down, safe havens up
3. Differentiate between SHORT-TERM and LONG-TERM impacts when relevant
4. For REGULATORY news, focus only on affected sectors (crypto bill → only crypto, not oil)
5. For GEOPOLITICAL events, analyze safe havens (gold, dollar, bonds) vs risk assets (stocks, crypto)
6. For ECONOMIC data, connect to Fed policy, inflation, growth expectations

CRITICAL: Only include markets ACTUALLY impacted. Be intelligent about market interconnections.

Respond with ONLY the JSON object. No markdown, no extra text.`;
}

// ========== ROBUST JSON PARSER ==========
function parseAnalysisJSON(raw: string): any {
  let cleaned = raw.trim();
  // Strip markdown code fences
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Try extracting the outermost JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // First attempt: direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Second attempt: fix trailing commas before } or ]
    try {
      const fixed = cleaned.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(fixed);
    } catch (_2) {
      throw new Error("Could not parse JSON from AI response");
    }
  }
}

// ========== DETERMINISTIC FALLBACK ANALYSIS ==========
// FIX: Replaced the broken final fallback (returned "irrelevant" for valid news)
// with a deterministic keyword-based analysis so analysis NEVER silently fails.
function deterministicAnalysis(text: string): {
  overallSentiment: string;
  summary: string;
  marketImpacts: Array<{ market: string; sentiment: string; impact: string; reasoning: string }>;
  narrative: string;
} {
  const lower = text.toLowerCase();

  // Sentiment scoring
  const bullishWords = ['surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'bullish', 'growth', 'profit',
    'beat', 'record', 'high', 'positive', 'strong', 'increase', 'up', 'buy', 'boom', 'expand',
    'upgrade', 'dividend', 'breakthrough', 'approval', 'launch', 'partnership', 'acquisition'];
  const bearishWords = ['crash', 'fall', 'drop', 'decline', 'plunge', 'bearish', 'loss', 'miss',
    'low', 'negative', 'weak', 'decrease', 'down', 'sell', 'recession', 'inflation', 'rate hike',
    'downgrade', 'layoff', 'bankruptcy', 'default', 'tariff', 'sanction', 'war', 'crisis'];

  let score = 0;
  for (const w of bullishWords) { if (lower.includes(w)) score++; }
  for (const w of bearishWords) { if (lower.includes(w)) score--; }

  const sentiment = score > 0 ? 'Bullish' : score < 0 ? 'Bearish' : 'Neutral';
  const sentimentEmoji = score > 0 ? 'positive' : score < 0 ? 'negative' : 'mixed';

  // Detect affected markets
  const impacts: Array<{ market: string; sentiment: string; impact: string; reasoning: string }> = [];

  const marketSignals: Array<{ keywords: string[]; market: string; bullish: string; bearish: string; neutral: string }> = [
    {
      keywords: ['stock', 'equity', 's&p', 'nasdaq', 'dow', 'shares', 'earnings', 'ipo', 'market'],
      market: 'US Stocks', bullish: 'Equity markets likely to see upward pressure', bearish: 'Equity markets face downward pressure',
      neutral: 'Mixed signals for equity markets'
    },
    {
      keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi', 'token', 'coin'],
      market: 'Crypto', bullish: 'Crypto assets may benefit from positive sentiment', bearish: 'Crypto assets could face selling pressure',
      neutral: 'Crypto markets may see sideways movement'
    },
    {
      keywords: ['gold', 'silver', 'precious metal', 'commodity', 'commodities', 'copper', 'iron'],
      market: 'Gold/Commodities', bullish: 'Commodity prices likely to rise', bearish: 'Commodity prices may face pressure',
      neutral: 'Commodities expected to trade sideways'
    },
    {
      keywords: ['oil', 'crude', 'energy', 'opec', 'petroleum', 'gas', 'lng'],
      market: 'Energy/Oil', bullish: 'Oil prices could increase', bearish: 'Oil prices may fall', neutral: 'Oil markets expected to stabilize'
    },
    {
      keywords: ['dollar', 'usd', 'dxy', 'forex', 'currency', 'euro', 'yen', 'pound'],
      market: 'US Dollar (DXY)', bullish: 'Dollar may strengthen', bearish: 'Dollar could weaken', neutral: 'Dollar expected to trade range-bound'
    },
    {
      keywords: ['bond', 'treasury', 'yield', 'interest rate', 'fed', 'federal reserve', 'bps', 'basis point'],
      market: 'Bonds/Treasuries', bullish: 'Bond prices may rise (yields fall)', bearish: 'Bond yields likely to rise (prices fall)',
      neutral: 'Bond markets may see limited movement'
    },
    {
      keywords: ['tech', 'ai', 'nvidia', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'semiconductor'],
      market: 'Tech Sector', bullish: 'Tech stocks may see upside', bearish: 'Tech sector faces headwinds',
      neutral: 'Tech stocks likely to remain range-bound'
    },
    {
      keywords: ['bank', 'financial', 'jpmorgan', 'goldman', 'morgan stanley', 'credit', 'loan', 'rate'],
      market: 'Banking/Financials', bullish: 'Financial sector could benefit', bearish: 'Banks may face margin pressure',
      neutral: 'Financial sector expected to be range-bound'
    },
  ];

  for (const signal of marketSignals) {
    if (signal.keywords.some(kw => lower.includes(kw))) {
      const marketSentiment = score > 0 ? 'Bullish' : score < 0 ? 'Bearish' : 'Neutral';
      const impact = score > 0 ? signal.bullish : score < 0 ? signal.bearish : signal.neutral;
      impacts.push({
        market: signal.market,
        sentiment: marketSentiment,
        impact,
        reasoning: `News context indicates ${sentimentEmoji} outlook for this market`
      });
    }
  }

  // Always include at least one general market impact
  if (impacts.length === 0) {
    impacts.push({
      market: 'General Markets',
      sentiment,
      impact: `Market conditions show ${sentimentEmoji} signals based on news content`,
      reasoning: 'Broad market sentiment derived from news analysis'
    });
  }

  const summary = `This financial news presents a ${sentiment.toLowerCase()} outlook for the markets. ` +
    `Analysis indicates ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'mixed'} signals ` +
    `across ${impacts.length} key market segment${impacts.length > 1 ? 's' : ''}. ` +
    `Traders should monitor developments closely for confirmation.`;

  const narrative = `Based on a thorough analysis of the provided news, the overall market sentiment appears ${sentiment.toLowerCase()}. ` +
    `${score > 1 ? 'Multiple bullish indicators suggest potential upside momentum.' :
      score < -1 ? 'Several bearish signals point to potential downside risk.' :
        'The mixed signals suggest a period of consolidation or uncertainty.'} ` +
    `Investors should consider risk management strategies and monitor related market sectors. ` +
    `This analysis is based on pattern recognition and should be combined with broader market research for investment decisions.`;

  return { overallSentiment: sentiment, summary, marketImpacts: impacts, narrative };
}

// ========== MAIN ANALYSIS FUNCTION ==========
export async function analyzeText(text: string): Promise<{
  intent: "sentiment" | "question" | "irrelevant";
  sentiment?: string;
  confidence?: number;
  reasoning?: string;
  sector?: string;
  answer?: string;
  overallSentiment?: string;
  summary?: string;
  marketImpacts?: Array<{
    market: string;
    sentiment: string;
    impact: string;
    reasoning: string;
  }>;
  narrative?: string;
}> {
  console.log(`\n🔍 Analyzing: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);

  // ========== STEP 1: Input validation ==========
  const trimmed = text.trim();
  if (!trimmed) {
    return { intent: "irrelevant", reasoning: "Please enter some text to analyze." };
  }

  // ========== STEP 2: Process the query intelligently ==========
  const processedQuery = processUserQuery(trimmed);
  console.log(`🧠 Processed: intent=${processedQuery.intent}, topic=${processedQuery.topic}, detail=${processedQuery.detailLevel}`);

  // ========== STEP 3: Fast path for personal non-financial statements ==========
  const lowerText = trimmed.toLowerCase();
  const personalPatterns = [
    /^i (like|love|hate|want|think|feel|believe)\s+(my|the|a\s)/i,
    /^my (brother|sister|friend|mom|dad|cat|dog)/i,
  ];
  for (const pattern of personalPatterns) {
    if (pattern.test(lowerText)) {
      console.log("🎯 Fast path: Personal non-financial statement");
      return {
        intent: "irrelevant",
        reasoning: "I'm here to help with financial market analysis. Feel free to ask me about stocks, crypto, bonds, or economic news!"
      };
    }
  }

  // ========== STEP 4: Determine if it's a question or news analysis ==========
  // FIX: Old logic required > 5 words AND no question mark. Short news headlines
  // (e.g. "Fed raises rates by 50bps") were wrongly classified as questions.
  // New logic: treat as news if no question mark, even if short.
  const hasQuestionMark = processedQuery.cleanedText.includes('?');
  const startsWithQuestionWord = /^(what|how|why|when|where|who|explain|tell me|define|is |are |does |do )\b/i.test(trimmed);
  const isNewsAnalysis = !hasQuestionMark && !startsWithQuestionWord;
  const isQuestion = !isNewsAnalysis;

  let prompt: string;

  if (isNewsAnalysis) {
    prompt = buildIntelligentPrompt(trimmed);
    console.log("📝 Using sentiment analysis prompt");
  } else {
    prompt = generateResponsePrompt(processedQuery);
    console.log(`📝 Using question prompt (${processedQuery.detailLevel} level)`);
  }

  // ========== STEP 5: Try Gemini (with 3 internal retries) ==========
  let geminiError: any = null;
  try {
    const response = await callGeminiAPI(prompt);
    console.log("📥 Gemini response received");

    if (isQuestion) {
      // Handle question response — plain text or JSON
      const jsonMatch = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '').match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          if (data.answer) {
            return { intent: "question", answer: data.answer, confidence: data.confidence || 90, sector: data.sector || "General" };
          }
        } catch (_) { /* fall through to plain text */ }
      }
      return { intent: "question", answer: response.substring(0, 1000), confidence: 90 };
    }

    // Parse sentiment JSON
    const data = parseAnalysisJSON(response);
    let narrative = data.narrative || data.summary || "";

    if (data.marketImpacts && data.marketImpacts.length > 0 && !data.narrative) {
      narrative = data.summary + "\n\n";
      for (const impact of data.marketImpacts) {
        narrative += `• ${impact.market}: ${impact.sentiment} - ${impact.impact}\n`;
      }
    }

    return {
      intent: "sentiment",
      sentiment: data.overallSentiment || "Neutral",
      confidence: 85,
      reasoning: narrative,
      sector: data.marketImpacts?.[0]?.market || "General Market",
      overallSentiment: data.overallSentiment,
      summary: data.summary,
      marketImpacts: data.marketImpacts,
      narrative: data.narrative
    };

  } catch (err: any) {
    geminiError = err;
    console.error("❌ Gemini failed after retries:", err.message);
  }

  // ========== STEP 6: Fallback to Groq ==========
  console.log("🔄 Switching to Groq fallback...");
  try {
    const groqResult = await analyzeWithGroq(trimmed, isQuestion);
    console.log("✅ Groq fallback successful");

    if (isQuestion) {
      return {
        intent: "question",
        answer: groqResult.answer || groqResult.content || "Analysis from Groq",
        confidence: groqResult.confidence || 85,
        sector: groqResult.sector || "General"
      };
    }

    let narrative = groqResult.narrative || groqResult.summary || "";
    if (groqResult.marketImpacts && groqResult.marketImpacts.length > 0 && !groqResult.narrative) {
      narrative = groqResult.summary + "\n\n";
      for (const impact of groqResult.marketImpacts) {
        narrative += `• ${impact.market}: ${impact.sentiment} - ${impact.impact}\n`;
      }
    }

    return {
      intent: "sentiment",
      sentiment: groqResult.overallSentiment || "Neutral",
      confidence: 80,
      reasoning: narrative,
      sector: groqResult.marketImpacts?.[0]?.market || "General Market",
      overallSentiment: groqResult.overallSentiment,
      summary: groqResult.summary,
      marketImpacts: groqResult.marketImpacts,
      narrative: groqResult.narrative
    };

  } catch (groqError: any) {
    console.error("❌ Groq fallback failed:", groqError.message);
  }

  // ========== STEP 7: Deterministic local fallback ==========
  // FIX: Old code returned intent:"irrelevant" here — which caused the
  // "Unable to complete analysis" message for valid financial news.
  // Now we run a deterministic keyword-based analysis that ALWAYS produces output.
  if (isNewsAnalysis) {
    console.log("🔧 Using deterministic keyword-based fallback analysis...");
    const fallback = deterministicAnalysis(trimmed);
    let narrative = fallback.narrative;
    if (fallback.marketImpacts.length > 0) {
      narrative = fallback.summary + "\n\n";
      for (const impact of fallback.marketImpacts) {
        narrative += `• ${impact.market}: ${impact.sentiment} - ${impact.impact}\n`;
      }
      narrative += "\n" + fallback.narrative;
    }
    return {
      intent: "sentiment",
      sentiment: fallback.overallSentiment,
      confidence: 65,
      reasoning: narrative,
      sector: fallback.marketImpacts?.[0]?.market || "General Market",
      overallSentiment: fallback.overallSentiment,
      summary: fallback.summary,
      marketImpacts: fallback.marketImpacts,
      narrative: fallback.narrative
    };
  }

  // For questions: local keyword answers
  const { topic, detailLevel } = processedQuery;
  const quickAnswers: Record<string, string> = {
    'solana': 'Solana is a high-performance blockchain platform designed for decentralized applications and crypto transactions, known for its fast speeds and low costs.',
    'bitcoin': 'Bitcoin is the first and largest cryptocurrency, a decentralized digital currency that operates without a central bank.',
    'ethereum': 'Ethereum is a decentralized blockchain platform that enables smart contracts and decentralized applications (dApps).',
    'bond': 'A bond is a fixed-income instrument representing a loan made by an investor to a borrower (typically corporate or governmental).',
    'stock': 'A stock represents ownership in a company and a claim on part of its assets and earnings.',
    'inflation': 'Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power.',
    'fed': 'The Federal Reserve is the central bank of the US, responsible for monetary policy and financial stability.',
    'crypto': 'Cryptocurrency is digital or virtual currency secured by cryptography, operating on decentralized networks called blockchains.',
    'etf': 'An ETF (Exchange-Traded Fund) is a collection of securities that trades on an exchange like a stock.',
    'dividend': 'A dividend is a distribution of a portion of a company\'s earnings to its shareholders.'
  };

  for (const [key, answer] of Object.entries(quickAnswers)) {
    if (processedQuery.cleanedText.includes(key) || topic.includes(key)) {
      return {
        intent: "question",
        answer: detailLevel === 'brief' ? answer.split('.')[0] + '.' : answer,
        confidence: 75
      };
    }
  }

  return {
    intent: "question",
    answer: `I understand you're asking about "${topic}". This is an important financial concept. For the most accurate answer, please check your API connection or try rephrasing your question.`,
    confidence: 60
  };
}

// ========== GET STATUS ==========
export function getAPIStatus() {
  return {
    remainingThisMinute: getRemainingRequests(),
    remainingToday: getRemainingToday(),
    timeUntilResetSeconds: getTimeUntilDailyReset(),
    queuedRequests: requestQueue.length,
    totalToday: totalRequestsToday,
    maxPerMinute: MAX_REQUESTS_PER_MINUTE,
    maxPerDay: MAX_REQUESTS_PER_DAY
  };
}

export const geminiService = {
  analyzeText,
  getAPIStatus
};
