import React, { useState, useEffect } from 'react';
import { Sentiment, Intent } from '../types';
import { BearishIcon, BullishIcon, NeutralIcon } from './icons';

interface ConfidenceGaugeProps {
  confidence: number | null;
  relevance: number | null;
  sentiment: Sentiment | null;
  intent: Intent | null;
}

interface SentimentConfig {
  color: string;
  glow: string;
  gradient: string;
  shadow: string;
  pulse: string;
  bgGradient: string;
  iconColor: string;
  iconGlow: string;
  relevanceColor: string;
  relevanceGlow: string;
  relevanceIcon: string;
}

interface IntentConfig {
  gradient: string;
  iconGlow: string;
  relevanceColor: string;
  relevanceGlow: string;
  relevanceIcon: string;
}

const sentimentConfig: Record<Sentiment, SentimentConfig> = {
  [Sentiment.Bullish]: {
    color: 'stroke-green-400',
    glow: 'drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]',
    gradient: 'from-green-400 to-emerald-300',
    shadow: 'shadow-lg shadow-green-500/25',
    pulse: 'animate-pulse-green',
    bgGradient: 'from-green-500/15 to-emerald-400/10',
    iconColor: 'text-green-300',
    iconGlow: 'bg-green-500',
    relevanceColor: 'from-green-500 to-emerald-400',
    relevanceGlow: 'shadow-lg shadow-green-500/40',
    relevanceIcon: '📈'
  },
  [Sentiment.Bearish]: {
    color: 'stroke-red-400',
    glow: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]',
    gradient: 'from-red-400 to-rose-300',
    shadow: 'shadow-lg shadow-red-500/25',
    pulse: 'animate-pulse-red',
    bgGradient: 'from-red-500/15 to-rose-400/10',
    iconColor: 'text-red-300',
    iconGlow: 'bg-red-500',
    relevanceColor: 'from-red-500 to-rose-400',
    relevanceGlow: 'shadow-lg shadow-red-500/40',
    relevanceIcon: '📉'
  },
  [Sentiment.Neutral]: {
    color: 'stroke-cyan-400',
    glow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
    gradient: 'from-cyan-400 to-blue-300',
    shadow: 'shadow-lg shadow-cyan-500/25',
    pulse: 'animate-pulse-cyan',
    bgGradient: 'from-cyan-500/15 to-blue-400/10',
    iconColor: 'text-cyan-300',
    iconGlow: 'bg-cyan-500',
    relevanceColor: 'from-cyan-500 to-blue-400',
    relevanceGlow: 'shadow-lg shadow-cyan-500/40',
    relevanceIcon: '⚖️'
  }
};

const intentConfig: Record<Intent, IntentConfig> = {
  [Intent.Question]: {
    gradient: 'from-cyan-500 to-blue-500',
    iconGlow: 'bg-cyan-500',
    relevanceColor: 'from-cyan-500 to-blue-400',
    relevanceGlow: 'shadow-lg shadow-cyan-500/40',
    relevanceIcon: '❓'
  },
  [Intent.Suggestion]: {
    gradient: 'from-purple-500 to-indigo-500',
    iconGlow: 'bg-purple-500',
    relevanceColor: 'from-purple-500 to-indigo-400',
    relevanceGlow: 'shadow-lg shadow-purple-500/40',
    relevanceIcon: '💡'
  },
  [Intent.Irrelevant]: {
    gradient: 'from-yellow-500 to-amber-500',
    iconGlow: 'bg-yellow-500',
    relevanceColor: 'from-yellow-500 to-amber-400',
    relevanceGlow: 'shadow-lg shadow-yellow-500/40',
    relevanceIcon: '🌐'
  },
  [Intent.Chat]: {
    gradient: 'from-gray-500 to-slate-500',
    iconGlow: 'bg-gray-500',
    relevanceColor: 'from-gray-500 to-slate-400',
    relevanceGlow: 'shadow-lg shadow-gray-500/40',
    relevanceIcon: '💬'
  },
  [Intent.News]: {
    gradient: 'from-blue-500 to-cyan-500',
    iconGlow: 'bg-blue-500',
    relevanceColor: 'from-blue-500 to-cyan-400',
    relevanceGlow: 'shadow-lg shadow-blue-500/40',
    relevanceIcon: '📰'
  }
};

const intentIcons: Record<Intent, React.ReactNode> = {
  [Intent.Question]: (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  ),
  [Intent.Suggestion]: (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-purple-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    </div>
  ),
  [Intent.Irrelevant]: (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-yellow-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  ),
  [Intent.Chat]: (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-gray-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    </div>
  ),
  [Intent.News]: (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-blue-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
    </div>
  )
};

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence, relevance, sentiment, intent }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const finalConfidence = confidence ?? 0;
  const offset = circumference - (finalConfidence / 100) * circumference;
  
  // Determine which config to use based on sentiment or intent
  let currentConfig: SentimentConfig | IntentConfig | null = null;
  
  if (sentiment) {
    currentConfig = sentimentConfig[sentiment];
  } else if (intent) {
    currentConfig = intentConfig[intent];
  } else {
    currentConfig = sentimentConfig[Sentiment.Neutral];
  }
  
  // Default values to prevent crash
  const defaultConfig: SentimentConfig = {
    color: 'stroke-cyan-400',
    glow: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
    gradient: 'from-cyan-400 to-blue-300',
    shadow: 'shadow-lg shadow-cyan-500/25',
    pulse: 'animate-pulse-cyan',
    bgGradient: 'from-cyan-500/15 to-blue-400/10',
    iconColor: 'text-cyan-300',
    iconGlow: 'bg-cyan-500',
    relevanceColor: 'from-cyan-500 to-blue-400',
    relevanceGlow: 'shadow-lg shadow-cyan-500/40',
    relevanceIcon: '⚖️'
  };
  
  const config = currentConfig || defaultConfig;
  const isSentimentMode = sentiment !== null && confidence !== null;

  useEffect(() => {
    setDisplayValue(0);
    if (isSentimentMode && finalConfidence > 0) {
      let start = 0;
      const end = finalConfidence;
      const duration = 1200;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [finalConfidence, isSentimentMode]);

  // Dynamic relevance configuration based on sentiment/intent AND relevance score
  const getRelevanceConfig = () => {
    if (!relevance) return null;

    const baseConfig = {
      gradient: config.relevanceColor,
      glow: config.relevanceGlow,
      icon: config.relevanceIcon,
      text: 'text-white'
    };

    // Adjust based on relevance score
    if (relevance >= 80) return {
      ...baseConfig,
      intensity: 'High',
      pulse: 'animate-pulse'
    };
    if (relevance >= 65) return {
      ...baseConfig,
      intensity: 'Good',
      pulse: ''
    };
    if (relevance >= 40) return {
      ...baseConfig,
      gradient: 'from-yellow-500 to-amber-400',
      glow: 'shadow-lg shadow-yellow-500/40',
      icon: '⚠️',
      intensity: 'Moderate',
      pulse: 'animate-pulse'
    };
    return {
      ...baseConfig,
      gradient: 'from-orange-500 to-red-400',
      glow: 'shadow-lg shadow-orange-500/40',
      icon: '🔍',
      intensity: 'Low',
      pulse: 'animate-pulse'
    };
  };

  const relevanceConfig = getRelevanceConfig();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div 
        className={`relative h-40 w-40 transition-all duration-500 transform hover:scale-105 ${finalConfidence > 90 ? (config as SentimentConfig).pulse : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSentimentMode ? (
          <>
            {/* Animated Background Glow */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${(config as SentimentConfig).gradient} opacity-20 blur-xl transition-all duration-700 ${isHovered ? 'scale-110 opacity-30' : 'scale-100'}`}></div>
            
            <svg className="w-full h-full relative z-10 transform transition-all duration-500" viewBox="0 0 120 120">
              {/* Background Track with Gradient */}
              <defs>
                <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>
              <circle className="stroke-slate-700" strokeWidth="8" fill="transparent" r={radius} cx="60" cy="60" />
              
              {/* Animated Progress Circle */}
              <circle
                className={`${(config as SentimentConfig).color} ${(config as SentimentConfig).glow} transition-all duration-1000 ease-out`}
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="transparent" 
                r={radius} 
                cx="60" 
                cy="60"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  transform: 'rotate(-90deg)', 
                  transformOrigin: '50% 50%',
                }}
              />
              
              {/* Pulsing Center Dot */}
              {finalConfidence > 80 && (
                <circle 
                  cx="60" 
                  cy="60" 
                  r="4" 
                  className={`fill-current ${(config as SentimentConfig).color.replace('stroke-', '')} animate-ping opacity-75`}
                />
              )}
            </svg>
            
            {/* Percentage Display with Glow */}
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${(config as SentimentConfig).gradient} rounded-full blur-md opacity-50 ${isHovered ? 'scale-125' : ''} transition-all duration-500`}></div>
                <span className={`text-4xl font-bold bg-gradient-to-r ${(config as SentimentConfig).gradient} bg-clip-text text-transparent font-poppins relative z-10 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                  {Math.round(displayValue)}%
                </span>
              </div>
            </div>
            
            {/* Animated Rings */}
            {finalConfidence > 85 && (
              <>
                <div className={`absolute inset-0 rounded-full border-2 ${(config as SentimentConfig).color.replace('stroke-', 'border-')} opacity-30 animate-ping`}></div>
                <div className={`absolute inset-2 rounded-full border-2 ${(config as SentimentConfig).color.replace('stroke-', 'border-')} opacity-20 animate-ping animation-delay-300`}></div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Icon Background Glow */}
            <div className={`absolute inset-0 ${(config as IntentConfig).iconGlow || (config as SentimentConfig).iconGlow} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
            <div className="relative z-10 transform transition-all duration-500 hover:scale-110">
              {intent && intentIcons[intent] ? intentIcons[intent] : 
                <div className="relative group">
                  <div className={`absolute inset-0 ${(config as SentimentConfig).iconGlow} rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-60 group-hover:opacity-80`}></div>
                  <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 p-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30">
                    <NeutralIcon className={`w-10 h-10 ${(config as SentimentConfig).iconColor}`}/>
                  </div>
                </div>
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Dynamic Relevance Badge */}
      {relevance !== null && relevanceConfig && (
        <div 
          className={`mt-6 px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r ${relevanceConfig.gradient} ${relevanceConfig.glow} ${relevanceConfig.pulse} transition-all duration-500 transform hover:scale-105 hover:shadow-xl relative overflow-hidden group border border-white/10`}
          title={`Relevance: ${relevance}% - ${relevanceConfig.intensity} relevance based on financial context`}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <span className={`relative z-10 flex items-center gap-2 ${relevanceConfig.text}`}>
            <span className="text-base">{relevanceConfig.icon}</span>
            <span className="font-semibold tracking-wide">Relevance: {relevance}%</span>
          </span>
          
          {/* Corner accents */}
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/30 rounded-tr"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/30 rounded-bl"></div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceGauge;