import { ReactNode } from 'react';

// ==================== CORE ANALYSIS TYPES ====================
export enum Sentiment {
  Bullish = 'Bullish',
  Bearish = 'Bearish',
  Neutral = 'Neutral'
}

export enum Intent {
  News = 'news/market_text',
  Question = 'question/qa',
  Suggestion = 'suggestion/request',
  Chat = 'casual_chitchat',
  Irrelevant = 'irrelevant',
}

// 🔥 OPTIMIZED: Using type aliases for better memory usage
export type SentimentType = 'bullish' | 'bearish' | 'neutral';
export type AnalysisType = 'sentiment' | 'qa';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

// ==================== NEW: INTELLIGENCE SERVICE TYPES ====================
export interface ProcessedQuery {
  originalText: string;
  cleanedText: string;
  intent: 'explain' | 'define' | 'compare' | 'analyze' | 'sentiment' | 'question';
  topic: string;
  detailLevel: 'brief' | 'standard' | 'detailed';
  confidence: number;
}

export interface IntentPattern {
  type: 'define' | 'explain' | 'compare' | 'analyze' | 'sentiment' | 'question';
  pattern: RegExp;
}

export interface SpellCorrection {
  typo: string;
  correct: string;
}

export interface FinancialTerm {
  term: string;
  variations: string[];
}

// ==================== EXISTING TYPES (Keep all your existing types below) ====================

export interface AnalysisResult {
  sentiment: Sentiment;
  confidence: number;
  reasoning: string;
}

export interface InputAnalysis {
  intent: Intent;
  relevance: number;
  reasoningForScore: string;
  suggestedQuery?: string;
}

export interface QA_SuggestionResult {
  title: string;
  content: ReactNode;
}

export type FlowState = 
  | 'idle'
  | 'analyzing_intent'
  | 'analyzing_sentiment'
  | 'generating_response'
  | 'prompt_irrelevant'
  | 'prompt_borderline'
  | 'showing_sentiment'
  | 'showing_qa_suggestion';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  input: string;
  intent: Intent;
  relevance: number;
  sentiment?: string;
  confidence?: number;
  reasoning?: string;
  sector?: string;
  type?: AnalysisType;
  wasForced?: boolean;
}

// ==================== MARKET DATA TYPES ====================
export interface MarketData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  sparkline: number[];
  volume?: number;
}

export interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update: string;
}

export interface FearGreedResponse {
  name: string;
  data: FearGreedData[];
  metadata: {
    error: string | null;
  };
}

export interface MarketSentiment {
  score: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  emoji: string;
  color: string;
  lastUpdated: string;
}

// ==================== TRADING & EDUCATION TYPES ====================
export interface TradingTip {
  id: number;
  category: 'trading' | 'investment' | 'psychology' | 'risk' | 'strategy' | 'technical' | 'fundamental';
  title: string;
  content: string;
  author?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ==================== RISK CALCULATOR TYPES ====================
export interface TradePosition {
  mode: 'spot' | 'futures';
  direction: 'long' | 'short';
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  investmentAmount: number;
  leverage: number;
}

export interface PNLResult {
  pnlAtTakeProfit: number;
  pnlAtStopLoss: number;
  roiAtTakeProfit: number;
  roiAtStopLoss: number;
  riskRewardRatio: number;
  positionSize: number;
  tradeSize: number;
  liquidationPrice: number;
  marginUsed: number;
  safetyMargin: number;
  riskLevel: RiskLevel;
  isProfitableAtTP: boolean;
  isProfitableAtSL: boolean;
}

export interface RiskAssessment {
  level: RiskLevel;
  color: string;
  message: string;
  isProfitable: boolean;
  liquidationRisk: 'safe' | 'caution' | 'danger' | 'extreme';
  leverageWarning: boolean;
}

export interface CalculatorMode {
  current: 'spot' | 'futures';
  isAnimating: boolean;
}

export interface TradeValidation {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export interface CalculatorResults {
  spot: {
    positionSize: number;
    pnlAtTP: number;
    pnlAtSL: number;
    roiAtTP: number;
    roiAtSL: number;
    riskReward: number;
    riskAmount: number;
  };
  futures: {
    tradeSize: number;
    positionSize: number;
    pnlAtTP: number;
    pnlAtSL: number;
    roiAtTP: number;
    roiAtSL: number;
    riskReward: number;
    liquidationPrice: number;
    marginUsed: number;
    safetyMargin: number;
    leverageImpact: number;
  };
}

// ==================== NEWS API TYPES ====================
// UPDATED: Added 'finnhub' to source types
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: 'alphavantage' | 'coingecko' | 'finnhub';  // ✅ ADDED 'finnhub'
  publishedAt: string;
  imageUrl?: string;
  category: 'crypto' | 'financial' | 'general';
  sentiment?: 'positive' | 'negative' | 'neutral';
  tickers?: string[];
}

export interface AlphaVantageNewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: 'Bullish' | 'Bearish' | 'Neutral';
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

export interface AlphaVantageNewsResponse {
  feed: AlphaVantageNewsItem[];
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
}

export interface CoinGeckoNewsItem {
  id: string;
  title: string;
  content: string;
  url: string;
  imageurl: string;
  published_on: number;
  source: string;
  tags: string;
  categories: string;
  upvotes: string;
  downvotes: string;
}

export interface CoinGeckoNewsResponse {
  Data: CoinGeckoNewsItem[];
  HasWarning: boolean;
  Message: string;
  RateLimit: object;
  Type: number;
}

export interface NewsServiceConfig {
  alphaVantageApiKey: string;
  cacheTimeout: number;
}

// UPDATED: Added 'finnhub' and 'mock' to source types
export interface NewsFetchResult {
  articles: NewsArticle[];
  lastUpdated: string;
  source: 'alphavantage' | 'coingecko' | 'both' | 'finnhub' | 'mock';  // ✅ ADDED 'finnhub' and 'mock'
  error?: string;
}

// ==================== SUPABASE AUTH & ANALYSIS TYPES ====================
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export interface Analysis {
  id?: string;
  user_id?: string;
  news_text: string;
  sentiment: SentimentType;
  confidence: number;
  keywords: string[];
  created_at: string;
  is_guest?: boolean;
}

export interface AnalysisResponse {
  data: Analysis[];
  error: string | null;
}

export interface GuestAnalysis extends Analysis {
  is_guest: true;
  local_id: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export type CombinedHistory = 
  | (HistoryEntry & { source: 'legacy' }) 
  | (Analysis & { source: 'supabase' }) 
  | (GuestAnalysis & { source: 'guest' });

// ==================== USER ANALYTICS TYPES ====================
export interface SentimentDistribution {
  bullish: number;
  bearish: number;
  neutral: number;
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface KeywordFrequency {
  keyword: string;
  frequency: number;
}

export interface PerformanceMetrics {
  averageConfidence: number;
  consistencyScore: number;
  mostActivePeriod: string;
  totalAnalyses: number;
}

export interface UserAnalytics {
  sentimentDistribution: SentimentDistribution;
  timelineData: TimelineData[];
  topKeywords: KeywordFrequency[];
  performanceMetrics: PerformanceMetrics;
  recentAnalyses: Analysis[];
}

export interface AnalyticsServiceResponse {
  data: UserAnalytics | null;
  error: string | null;
  success: boolean;
}

export interface UserAnalyticsDashboardProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export interface AnalysisStatsChartProps {
  sentimentDistribution: SentimentDistribution;
  totalAnalyses: number;
}

export interface UserProfileCardProps {
  user: User;
  analytics: UserAnalytics;
}

export interface TradingPerformanceProps {
  performanceMetrics: PerformanceMetrics;
  topKeywords: KeywordFrequency[];
}

// ==================== ENHANCED RESPONSE TYPES ====================
export interface EnhancedAnalysisResponse {
  intent: 'sentiment' | 'question' | 'irrelevant';
  sentiment?: SentimentType;
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
}

// ==================== GROQ SERVICE TYPES ====================
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature: number;
  max_tokens: number;
}

export interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GroqStatus {
  remainingThisMinute: number;
  maxPerMinute: number;
}