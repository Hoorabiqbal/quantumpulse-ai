// src/services/intelligenceService.ts

/**
 * INTELLIGENT QUERY PROCESSOR
 * Handles typos, grammar mistakes, and varying detail levels
 * Like DeepSeek but for financial queries
 */

interface ProcessedQuery {
  originalText: string;
  cleanedText: string;
  intent: 'explain' | 'define' | 'compare' | 'analyze' | 'sentiment' | 'question';
  topic: string;
  detailLevel: 'brief' | 'standard' | 'detailed';
  confidence: number;
}

// Common financial terms and their variations
const FINANCIAL_TERMS: Record<string, string[]> = {
  'bitcoin': ['btc', 'bit coin', 'bitcoin'],
  'ethereum': ['eth', 'ether', 'ethereum'],
  'solana': ['sol', 'solona', 'solona', 'solanaa'],
  'bond': ['bonds', 'treasury', 'government bond', 'corporate bond'],
  'stock': ['stocks', 'equity', 'shares', 'equities'],
  'crypto': ['cryptocurrency', 'crypto currency', 'digital asset'],
  'inflation': ['price increase', 'cpi', 'consumer price'],
  'fed': ['federal reserve', 'central bank', 'fomc'],
  'recession': ['economic downturn', 'depression', 'slowdown'],
};

// Detail level indicators
const DETAIL_INDICATORS = {
  brief: ['brief', 'short', 'quick', 'one line', 'summarize', 'tl;dr', "don't explain", 'simply', 'basic'],
  detailed: ['detailed', 'in depth', 'comprehensive', 'full', 'explain thoroughly', 'elaborate', 'deep dive', 'complete'],
};

// Intent patterns
const INTENT_PATTERNS = {
  define: /^(what is|define|explain me|tell me about|what's|whats)\s+(.+)/i,
  explain: /^(explain|how does|how do|why does|why do)\s+(.+)/i,
  compare: /^(compare|difference between|vs|versus)\s+(.+)/i,
  analyze: /^(analyze|sentiment|analysis of|opinion on)\s+(.+)/i,
  explain_detail: /^(explain in detail|detailed explanation of|elaborate on)\s+(.+)/i,
  brief_explain: /^(explain briefly|quick explanation of|short explanation of)\s+(.+)/i,
};

// Spell correction mappings (common typos)
const TYPO_CORRECTIONS: Record<string, string> = {
  // Crypto typos
  'solona': 'solana',
  'solano': 'solana',
  'solna': 'solana',
  'bitocoin': 'bitcoin',
  'bitecoin': 'bitcoin',
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'ethe': 'ethereum',
  'etherium': 'ethereum',
  
  // Financial typos
  'stock': 'stock',
  'stok': 'stock',
  'bond': 'bond',
  'bonnd': 'bond',
  'markit': 'market',
  'market': 'market',
  
  // Economic typos
  'inflaton': 'inflation',
  'infaltion': 'inflation',
  'recssion': 'recession',
  'recsion': 'recession',
  'federal': 'fed',
  'fedral': 'fed',
};

function correctSpelling(text: string): string {
  let corrected = text.toLowerCase();
  
  // Fix common typos
  for (const [typo, correct] of Object.entries(TYPO_CORRECTIONS)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  }
  
  // Fix spacing issues
  corrected = corrected.replace(/([a-z])([A-Z])/g, '$1 $2');
  corrected = corrected.replace(/\s+/g, ' ');
  
  return corrected;
}

function extractTopic(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for known financial terms
  for (const [term, variations] of Object.entries(FINANCIAL_TERMS)) {
    for (const variation of variations) {
      if (lowerText.includes(variation)) {
        return term;
      }
    }
  }
  
  // Extract the main noun phrase after question words
  const patterns = [
    /what is\s+(.+?)(?:\?|$)/i,
    /explain\s+(.+?)(?:\?|$)/i,
    /about\s+(.+?)(?:\?|$)/i,
    /tell me about\s+(.+?)(?:\?|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const words = match[1].split(' ');
      if (words.length > 3) {
        return words.slice(0, 3).join(' ');
      }
      return match[1].trim();
    }
  }
  
  // Return first 3 words as topic
  const words = text.split(' ');
  return words.slice(0, 3).join(' ');
}

function detectDetailLevel(text: string): 'brief' | 'standard' | 'detailed' {
  const lowerText = text.toLowerCase();
  
  // Check for brief indicators
  for (const indicator of DETAIL_INDICATORS.brief) {
    if (lowerText.includes(indicator)) {
      return 'brief';
    }
  }
  
  // Check for detailed indicators
  for (const indicator of DETAIL_INDICATORS.detailed) {
    if (lowerText.includes(indicator)) {
      return 'detailed';
    }
  }
  
  // Default to standard
  return 'standard';
}

function detectIntent(text: string): 'explain' | 'define' | 'compare' | 'analyze' | 'sentiment' | 'question' {
  const lowerText = text.toLowerCase();
  
  if (INTENT_PATTERNS.compare.test(lowerText)) return 'compare';
  if (INTENT_PATTERNS.analyze.test(lowerText)) return 'analyze';
  if (INTENT_PATTERNS.explain_detail.test(lowerText)) return 'explain';
  if (INTENT_PATTERNS.brief_explain.test(lowerText)) return 'explain';
  if (INTENT_PATTERNS.explain.test(lowerText)) return 'explain';
  if (INTENT_PATTERNS.define.test(lowerText)) return 'define';
  
  // Check for sentiment indicators
  if (lowerText.includes('sentiment') || lowerText.includes('feeling') || lowerText.includes('mood')) {
    return 'sentiment';
  }
  
  return 'question';
}

function calculateConfidence(cleanedText: string, originalText: string): number {
  let confidence = 0.85; // Start high
  
  // Reduce confidence if many corrections were made
  if (cleanedText !== originalText.toLowerCase()) {
    const changes = originalText.length - cleanedText.length;
    confidence -= Math.min(0.3, changes / originalText.length);
  }
  
  // Ensure confidence is within bounds
  return Math.max(0.6, Math.min(0.95, confidence));
}

export function processUserQuery(query: string): ProcessedQuery {
  console.log(`🧠 Processing query: "${query}"`);
  
  // Step 1: Correct spelling and grammar
  const cleanedText = correctSpelling(query);
  if (cleanedText !== query.toLowerCase()) {
    console.log(`📝 Corrected to: "${cleanedText}"`);
  }
  
  // Step 2: Detect intent
  const intent = detectIntent(cleanedText);
  console.log(`🎯 Intent: ${intent}`);
  
  // Step 3: Extract topic
  const topic = extractTopic(cleanedText);
  console.log(`📚 Topic: ${topic}`);
  
  // Step 4: Determine detail level
  const detailLevel = detectDetailLevel(cleanedText);
  console.log(`📊 Detail level: ${detailLevel}`);
  
  // Step 5: Calculate confidence
  const confidence = calculateConfidence(cleanedText, query);
  
  return {
    originalText: query,
    cleanedText,
    intent,
    topic,
    detailLevel,
    confidence,
  };
}

export function generateResponsePrompt(processed: ProcessedQuery): string {
  const { topic, intent, detailLevel, cleanedText } = processed;
  
  let instruction = '';
  
  switch (detailLevel) {
    case 'brief':
      instruction = 'Answer in ONE SENTENCE. Be extremely concise. NO extra explanation.';
      break;
    case 'detailed':
      instruction = 'Provide a DETAILED, COMPREHENSIVE answer. Include examples, context, and implications. Use 4-6 paragraphs with clear structure.';
      break;
    case 'standard':
      instruction = 'Provide a CLEAR, INFORMATIVE answer in 2-3 paragraphs. Balance completeness with conciseness.';
      break;
  }
  
  let formatInstruction = '';
  switch (intent) {
    case 'define':
      formatInstruction = 'Start with "It is..." or a clear definition. Then explain why it matters.';
      break;
    case 'compare':
      formatInstruction = 'Use a structured comparison. List similarities first, then differences. Be specific.';
      break;
    case 'analyze':
      formatInstruction = 'Provide analysis with specific reasoning. Include market impact if relevant.';
      break;
    case 'sentiment':
      formatInstruction = 'Analyze market sentiment. Be specific about bullish/bearish indicators.';
      break;
    default:
      formatInstruction = 'Be direct and helpful. Answer the question thoroughly.';
  }
  
  return `You are a world-class financial expert. Answer the following query.

QUERY: "${cleanedText}"
TOPIC: ${topic}
INTENT: ${intent}

${instruction}
${formatInstruction}

RULES:
- Be ACCURATE and SPECIFIC
- If there are typos in the query, understand the intended meaning
- Adapt your response length to the requested detail level
- Use simple, clear language for basic concepts
- Provide depth for advanced topics

Respond with a natural, helpful answer. Do not use markdown. Just plain text.`;
}