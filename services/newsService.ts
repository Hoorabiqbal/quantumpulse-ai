// src/services/newsService.ts (Simplified - Finnhub only)
import { NewsArticle, NewsFetchResult } from '../types';

let newsCache: {
  data: NewsArticle[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

export const fetchFinancialNews = async (): Promise<NewsArticle[]> => {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (newsCache && (now - newsCache.timestamp) < CACHE_DURATION) {
    console.log('📦 Using cached news');
    return newsCache.data;
  }

  try {
    const articles = await fetchFinnhubNews();
    
    newsCache = {
      data: articles,
      timestamp: now
    };
    
    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews();
  }
};

const fetchFinnhubNews = async (): Promise<NewsArticle[]> => {
  if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'your_finnhub_key_here') {
    console.warn('⚠️ Finnhub API key not configured');
    return getMockNews();
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid response format');
  }

  return data.slice(0, 10).map((item: any): NewsArticle => ({
    id: `fh-${item.id || Date.now()}`,
    title: item.headline || 'Market Update',
    description: item.summary || item.headline || 'Latest market news',
    url: item.url || '#',
    source: 'finnhub',
    publishedAt: new Date(item.datetime * 1000).toISOString(),
    imageUrl: item.image,
    category: determineCategory(item.headline + ' ' + (item.summary || '')),
    sentiment: mapSentiment(item.sentiment),
    tickers: extractTickers(item.related || '')
  }));
};

const determineCategory = (content: string): 'crypto' | 'financial' | 'general' => {
  const lower = content.toLowerCase();
  if (['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain'].some(k => lower.includes(k))) return 'crypto';
  if (['stock', 'market', 'fed', 'interest', 'earnings', 'nasdaq', 'sp500'].some(k => lower.includes(k))) return 'financial';
  return 'general';
};

const mapSentiment = (sentiment: number | string | undefined): 'positive' | 'negative' | 'neutral' => {
  if (!sentiment) return 'neutral';
  if (typeof sentiment === 'number') {
    if (sentiment > 0.2) return 'positive';
    if (sentiment < -0.2) return 'negative';
    return 'neutral';
  }
  const s = String(sentiment).toLowerCase();
  if (s === 'positive' || s === 'bullish') return 'positive';
  if (s === 'negative' || s === 'bearish') return 'negative';
  return 'neutral';
};

const extractTickers = (text: string): string[] => {
  if (!text) return [];
  const matches = text.match(/\b[A-Z]{1,5}\b/g) || [];
  const common = ['THE', 'AND', 'FOR', 'YOU', 'ARE', 'BTC', 'ETH', 'USD'];
  return [...new Set(matches)].filter(t => !common.includes(t)).slice(0, 5);
};

const getMockNews = (): NewsArticle[] => [
  {
    id: 'mock-1',
    title: "Markets Rally on Rate Cut Hopes",
    description: "Global markets surge as investors anticipate central bank rate cuts.",
    source: "finnhub",
    publishedAt: new Date().toISOString(),
    url: "#",
    sentiment: "positive",
    category: "financial",
    tickers: ["SPY", "QQQ"]
  },
  {
    id: 'mock-2',
    title: "Tech Stocks Lead Market Gains",
    description: "Technology sector shows strong performance amid AI optimism.",
    source: "finnhub",
    publishedAt: new Date().toISOString(),
    url: "#",
    sentiment: "positive",
    category: "financial",
    tickers: ["AAPL", "MSFT", "NVDA"]
  },
  {
    id: 'mock-3',
    title: "Bitcoin Tests Key Resistance Level",
    description: "Cryptocurrency markets show volatility as Bitcoin approaches major price levels.",
    source: "finnhub",
    publishedAt: new Date().toISOString(),
    url: "#",
    sentiment: "neutral",
    category: "crypto",
    tickers: ["BTC", "ETH"]
  }
];