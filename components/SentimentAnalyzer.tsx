// Market/components/SentimentAnalyzer.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import ConfidenceGauge from './ConfidenceGauge';
import ReasoningCard from './ReasoningCard';
import { HistoryEntry, Intent, User, Sentiment } from '../types';
import { analyzeText, getAPIStatus } from '../services/geminiService';

// Component Props
interface SentimentAnalyzerProps {
  onNewAnalysis?: (entry: HistoryEntry) => void;
  user: User | null;
}

// Helper function to map string sentiment to Sentiment enum
const mapToSentimentEnum = (sentiment: string): Sentiment => {
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment === 'bullish') return Sentiment.Bullish;
  if (lowerSentiment === 'bearish') return Sentiment.Bearish;
  return Sentiment.Neutral;
};

// Helper function to map intent string to Intent enum
const mapToIntentEnum = (intent: string): Intent => {
  switch (intent) {
    case 'sentiment':
      return Intent.News;
    case 'question':
      return Intent.Question;
    case 'irrelevant':
      return Intent.Irrelevant;
    default:
      return Intent.Chat;
  }
};

const FINANCIAL_KEYWORDS = [
  "Bitcoin", "Ethereum", "Crypto", "Federal Reserve", "Interest Rates",
  "Inflation", "CPI", "Tech Stocks", "Earnings", "Tesla", "Nvidia",
  "Apple", "Microsoft", "Bull Market", "Bear Market", "Recession",
  "S&P 500", "Nasdaq", "Dow Jones", "Volatility", "Dividends", "Bonds",
  "Treasury Yields", "Gold", "Oil", "Commodities", "Options", "Derivatives",
  "ETFs", "Mutual Funds", "Portfolio", "Diversification", "Liquidity",
  "Market Cap", "IPO", "Merger", "Acquisition", "Revenue", "Profit Margin",
  "Cash Flow", "Balance Sheet", "Guidance", "Analysts", "Downgrade", "Upgrade"
].sort();

// Main Component
export default function SentimentAnalyzer({ onNewAnalysis, user }: SentimentAnalyzerProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [apiStatus, setApiStatus] = useState({
    remainingThisMinute: 10,
    remainingToday: 250,
    queuedRequests: 0,
    totalToday: 0
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      }
    }
  }, [isListening]);

  // Update API status every 10 seconds
  useEffect(() => {
    const updateStatus = () => {
      try {
        const status = getAPIStatus();
        setApiStatus({
          remainingThisMinute: status.remainingThisMinute,
          remainingToday: status.remainingToday,
          queuedRequests: status.queuedRequests || 0,
          totalToday: status.totalToday || 0
        });
      } catch (e) {
        console.warn("API status not available");
      }
    };
    updateStatus();
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = useCallback(async () => {
    const trimmedInput = input.trim();
    // FIX: Show user-friendly validation instead of silently ignoring
    if (!trimmedInput) {
      setResult({
        sentiment: "Error",
        reasoning: "Please enter some financial news or a market-related question to analyze.",
        confidence: 0,
        sector: "General"
      });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      // Single API call for everything!
      const analysis = await analyzeText(trimmedInput);

      let res;
      let intent: Intent;
      let type: "qa" | "sentiment";
      let sentiment = "Neutral";
      let reasoning = "";
      let confidence = 80;
      let sector = "General";

      if (analysis.intent === "sentiment") {
        // Sentiment analysis result
        intent = Intent.News;
        type = "sentiment";
        sentiment = analysis.sentiment || "Neutral";
        reasoning = analysis.reasoning || "Based on market analysis.";
        confidence = analysis.confidence || 85;
        sector = analysis.sector || "General Market";

        res = {
          sentiment: sentiment,
          reasoning: reasoning,
          confidence: confidence,
          sector: sector
        };

      } else if (analysis.intent === "question") {
        // Question response
        intent = Intent.Question;
        type = "qa";
        sentiment = "N/A";
        reasoning = analysis.answer || "I couldn't generate an answer.";
        confidence = 85;
        sector = "Education";

        res = {
          sentiment: "N/A",
          reasoning: reasoning,
          confidence: confidence,
          sector: "Education"
        };

      } else {
        // Irrelevant content (personal statements, non-financial)
        intent = Intent.Irrelevant;
        type = "sentiment";
        sentiment = "Irrelevant";
        reasoning = analysis.reasoning || "This doesn't appear to be related to financial markets or economics.";
        confidence = 90;
        sector = "General";

        res = {
          sentiment: "Irrelevant",
          reasoning: reasoning,
          confidence: confidence,
          sector: "General"
        };
      }

      setResult(res);

      // Save analysis (skip irrelevant content)
      if (analysis.intent !== "irrelevant" && onNewAnalysis) {
        const historyEntry: HistoryEntry = {
          id: `temp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          input: trimmedInput,
          intent: intent,
          relevance: 85,
          sentiment: sentiment,
          confidence: confidence,
          reasoning: reasoning,
          sector: sector,
          type: type
        };
        onNewAnalysis(historyEntry);
      }

      // Update API status after analysis
      try {
        const status = getAPIStatus();
        setApiStatus({
          remainingThisMinute: status.remainingThisMinute,
          remainingToday: status.remainingToday,
          queuedRequests: status.queuedRequests || 0,
          totalToday: status.totalToday || 0
        });
      } catch (e) {
        // Ignore
      }

    } catch (error) {
      console.error("❌ Analysis Error:", error);
      // FIX: Provide helpful error message instead of generic failure
      const errMsg = error instanceof Error ? error.message : String(error);
      const isNetworkError = errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed to fetch');
      setResult({
        sentiment: "Error",
        reasoning: isNetworkError
          ? "Network error: Unable to reach AI services. Please check your internet connection and API keys, then try again."
          : "Analysis encountered an unexpected error. Please try again in a moment.",
        confidence: 0,
        sector: "General"
      });
    } finally {
      setLoading(false);

      setTimeout(() => {
        if (resultsRef.current) {
          const yOffset = 120;
          const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [input, onNewAnalysis]);

  const handleKeywordSelect = useCallback((keyword: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = input.substring(0, cursorPosition);
    const textAfterCursor = input.substring(cursorPosition);

    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    const newTextBeforeCursor = textBeforeCursor.substring(0, textBeforeCursor.length - currentWord.length) + keyword + " ";

    setInput(newTextBeforeCursor + textAfterCursor);
    setSuggestions([]);

    // Focus and restore cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newTextBeforeCursor.length, newTextBeforeCursor.length);
    }, 0);
  }, [input]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleKeywordSelect(suggestions[activeSuggestionIndex]);
        return;
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  }, [handleAnalyze, suggestions, activeSuggestionIndex, handleKeywordSelect]);

  const handleInputFocus = useCallback(() => setIsInputFocused(true), []);
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    setTimeout(() => setSuggestions([]), 200);
  }, []);

  const getWordUnderCursor = (text: string, cursorPosition: number) => {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    return words[words.length - 1];
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const cursorPosition = e.target.selectionStart;
    const currentWord = getWordUnderCursor(value, cursorPosition);

    if (currentWord.length >= 2) {
      const matched = FINANCIAL_KEYWORDS.filter(kw =>
        kw.toLowerCase().startsWith(currentWord.toLowerCase()) &&
        kw.toLowerCase() !== currentWord.toLowerCase()
      ).slice(0, 5);

      setSuggestions(matched);
      setActiveSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  }, []);

  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish":
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-400/10',
          text: 'text-green-300',
          border: 'border-green-400/40',
          glow: 'shadow-lg shadow-green-500/30',
          gradient: 'from-green-400 to-emerald-300',
        };
      case "Bearish":
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-rose-400/10',
          text: 'text-red-300',
          border: 'border-red-400/40',
          glow: 'shadow-lg shadow-red-500/30',
          gradient: 'from-red-400 to-rose-300',
        };
      case "Irrelevant":
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-400/10',
          text: 'text-yellow-300',
          border: 'border-yellow-400/40',
          glow: 'shadow-lg shadow-yellow-500/30',
          gradient: 'from-yellow-400 to-amber-300',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-400/10',
          text: 'text-cyan-300',
          border: 'border-cyan-400/40',
          glow: 'shadow-lg shadow-cyan-500/30',
          gradient: 'from-cyan-400 to-blue-300',
        };
    }
  };

  // Determine the intent for ConfidenceGauge
  const getConfidenceGaugeIntent = (): Intent | null => {
    if (!result) return null;
    if (result.sentiment === "N/A") return Intent.Question;
    if (result.sentiment === "Irrelevant") return Intent.Irrelevant;
    return Intent.News;
  };

  // Determine sentiment for ConfidenceGauge
  const getConfidenceGaugeSentiment = (): Sentiment | null => {
    if (!result) return null;
    if (result.sentiment === "Bullish") return Sentiment.Bullish;
    if (result.sentiment === "Bearish") return Sentiment.Bearish;
    if (result.sentiment === "Neutral") return Sentiment.Neutral;
    return null;
  };

  return (
    <section className="mb-4 md:mb-6">
      {/* API Status Bar - Updated for correct limits */}
      <div className="mb-2 md:mb-3 flex flex-wrap justify-end gap-2 md:gap-3 text-[10px] md:text-xs">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${apiStatus.remainingThisMinute > 5 ? 'bg-green-400' : apiStatus.remainingThisMinute > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
          <span className="text-slate-400">{apiStatus.remainingThisMinute}/10 req/min</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700">
          <span className="text-slate-400">📊 {apiStatus.remainingToday}/250 left</span>
        </div>
        {apiStatus.queuedRequests > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <span className="text-yellow-400">⏳ {apiStatus.queuedRequests} queued</span>
          </div>
        )}
      </div>

      {/* Enhanced Input Section */}
      <div className="relative glassmorphism rounded-2xl p-3 md:p-4 lg:p-6 mb-3 md:mb-4 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/15 border border-slate-700/50 hover:border-cyan-500/40 overflow-hidden group">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-purple-500/2 to-blue-500/3 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

        {/* Floating Particles */}
        <div className="absolute top-3 right-4 w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-float-medium delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-25 animate-float-fast delay-500"></div>

        <div className="relative z-10">
          {/* Enhanced Input Label */}
          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3 px-1">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm font-semibold text-cyan-300 tracking-wide">FINANCIAL ANALYZER</span>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent ml-2"></div>

            {/* User Status Indicator */}
            <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border text-[10px] md:text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: user ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                borderColor: user ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                color: user ? 'rgb(74, 222, 128)' : 'rgb(148, 163, 184)'
              }}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user ? 'bg-green-400' : 'bg-slate-400'}`}></div>
              <span>{user ? `Auto-Saving (${user.name})` : 'Guest Mode'}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-3 md:space-y-4">
            {/* Enhanced Textarea */}
            <div className="relative">
              <textarea
                className={`w-full bg-slate-900/80 backdrop-blur-xl border rounded-2xl px-3 md:px-5 py-3 md:py-4 text-slate-200 placeholder-slate-400 focus:outline-none resize-none min-h-[100px] md:min-h-[120px] font-inter text-sm md:text-base font-normal leading-relaxed tracking-wide transition-all duration-500 ${isInputFocused
                  ? 'border-cyan-400/70 shadow-2xl shadow-cyan-500/25 bg-slate-900/90 placeholder-cyan-400/70'
                  : 'border-slate-600/60 hover:border-slate-500/80 hover:shadow-xl hover:shadow-cyan-500/15'
                  }`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#06b6d4 #1e293b'
                }}
                rows={3}
                placeholder="📈 Enter financial news, market analysis, or investment questions..."
                value={input}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyPress}
              />

              {/* Enhanced Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 blur-xl -z-10 transition-all duration-500 ${isInputFocused ? 'opacity-50 scale-105' : 'opacity-0 scale-100'
                }`}></div>

              {/* Bottom Border Animation */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full transition-transform duration-500 ${isInputFocused ? 'scale-x-100' : 'scale-x-0'
                }`}></div>

              {/* Type Indicator */}
              {input.length > 0 && !isListening && (
                <div className="absolute top-2 md:top-3 right-3 md:right-4">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] md:text-xs text-green-400 font-medium">Typing...</span>
                  </div>
                </div>
              )}

              {/* Listening Indicator */}
              {isListening && (
                <div className="absolute top-2 md:top-3 right-3 md:right-4">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] md:text-xs text-rose-400 font-medium tracking-widest uppercase animate-pulse">Listening...</span>
                  </div>
                </div>
              )}

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute bottom-3 md:bottom-4 right-3 md:right-4 p-2 md:p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center group/mic ${isListening
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700'
                  }`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
              >
                {isListening ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/mic:scale-110 transition-transform">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </button>

              {/* Keyword Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ top: 'calc(100% + 4px)' }}>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur to maintain focus
                        handleKeywordSelect(suggestion);
                      }}
                      className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${index === activeSuggestionIndex
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-200'
                        }`}
                    >
                      <span className="text-cyan-500/50">#</span>
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className={`relative min-h-[44px] w-full py-3 md:py-3.5 px-4 md:px-6 rounded-2xl font-bold text-sm md:text-base transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group ${loading
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50'
                }`}
            >
              {/* Animated Background Layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1500"></div>

              {/* Ripple Effect Container */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin animation-delay-500"></div>
                      </div>
                      <span className="text-white font-semibold tracking-wide text-sm">
                        AI Analysis in Progress...
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-inter font-bold tracking-wide drop-shadow-lg text-sm">
                        🚀 Deep Analysis
                      </span>
                      <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-ping"></div>
                    </div>
                    <div className="w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
                  </>
                )}
              </div>

              {/* Button Border Glow */}
              <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500 ${!loading && input.trim() ? 'group-hover:opacity-30' : ''
                }`}></div>
            </button>

            {/* Enhanced Status Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2 sm:gap-0">
              {/* Character Counter */}
              {input.length > 0 && (
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`font-medium transition-all duration-300 text-[10px] md:text-xs ${input.length > 500 ? 'text-red-400' :
                    input.length > 300 ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                    {input.length} characters
                  </span>

                  {/* Progress Indicator */}
                  <div className="w-12 md:w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${input.length > 500 ? 'bg-red-400' :
                        input.length > 300 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                      style={{ width: `${Math.min(100, (input.length / 600) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Keyboard Shortcut */}
              {input.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] md:text-xs font-medium">
                    Quick Analyze:
                  </span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded-lg text-cyan-400 text-[10px] md:text-xs font-mono border border-slate-600/50 shadow-inner">
                    Ctrl + Enter
                  </kbd>
                </div>
              )}
            </div>

            {/* Warning Message */}
            {input.length > 400 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-amber-400 text-[10px] md:text-xs font-medium">
                  ⚡ For best results, keep inputs concise and focused
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Results Section */}
      <div ref={resultsRef} className="mt-2">
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5 animate-fade-in">
            {/* Enhanced Confidence Gauge */}
            <div className="lg:col-span-1">
              <div className="glassmorphism rounded-2xl p-3 md:p-4 lg:p-5 h-full border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/15 group">
                <div className="text-center mb-3 md:mb-4">
                  <h3 className="font-poppins font-bold text-base md:text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 transition-all duration-500 group-hover:scale-105">
                    AI Confidence
                  </h3>
                  <ConfidenceGauge
                    confidence={result.confidence || (result.sentiment === "N/A" ? 80 : 30)}
                    relevance={result.sentiment === "Irrelevant" ? 20 : 85}
                    sentiment={getConfidenceGaugeSentiment()}
                    intent={getConfidenceGaugeIntent()}
                  />
                </div>

                {/* Enhanced Sentiment Tag */}
                <div className="text-center mt-3 md:mt-4">
                  <span className={`inline-flex min-h-[44px] items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm font-bold transition-all duration-500 transform hover:scale-105 relative overflow-hidden group ${getSentimentConfig(result.sentiment).border} ${getSentimentConfig(result.sentiment).bg} ${getSentimentConfig(result.sentiment).glow}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <span className={`relative z-10 ${getSentimentConfig(result.sentiment).text} drop-shadow-sm`}>
                      {result.sentiment === "N/A" ? "💡 Expert Q&A" :
                        result.sentiment === "Irrelevant" ? "🌐 General Query" :
                          `📊 ${result.sentiment} Outlook`}
                    </span>

                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getSentimentConfig(result.sentiment).gradient} animate-pulse`}></div>
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Reasoning Card */}
            <div className="lg:col-span-2">
              <ReasoningCard
                reasoning={result.reasoning}
                sentiment={result.sentiment !== "N/A" && result.sentiment !== "Irrelevant" ? mapToSentimentEnum(result.sentiment) : Sentiment.Neutral}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}