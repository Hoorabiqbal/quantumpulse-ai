import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FearGreedData } from '../types';

const CryptoFearGreedIndex: React.FC = () => {
  const [fearGreedData, setFearGreedData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized level configurations
  const getFearGreedLevel = useCallback((value: string) => {
    const numValue = parseInt(value);
    
    // Extreme Greed (90-100) - Vibrant Emerald
    if (numValue >= 90) return { 
      level: 'EXTREME GREED', 
      color: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-400',
      bg: 'from-emerald-900/30 via-emerald-900/20 to-emerald-900/10',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/40',
      intensity: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300',
      emoji: '🚀',
      barColor: 'bg-emerald-400'
    };
    
    // Greed (70-89) - Bright Cyan
    if (numValue >= 70) return { 
      level: 'GREED', 
      color: 'text-cyan-400',
      gradient: 'from-cyan-500 to-sky-400',
      bg: 'from-cyan-900/30 via-cyan-900/20 to-cyan-900/10',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/40',
      intensity: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-300',
      emoji: '📈',
      barColor: 'bg-cyan-400'
    };
    
    // Neutral (45-69) - Cool Blue
    if (numValue >= 45) return { 
      level: 'NEUTRAL', 
      color: 'text-blue-400',
      gradient: 'from-blue-500 to-indigo-400',
      bg: 'from-blue-900/30 via-blue-900/20 to-blue-900/10',
      border: 'border-blue-500/40',
      glow: 'shadow-blue-500/40',
      intensity: 'bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300',
      emoji: '⚖️',
      barColor: 'bg-blue-400'
    };
    
    // Fear (30-44) - Amber
    if (numValue >= 30) return { 
      level: 'FEAR', 
      color: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-400',
      bg: 'from-amber-900/30 via-amber-900/20 to-amber-900/10',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/40',
      intensity: 'bg-gradient-to-r from-amber-400 via-orange-300 to-red-300',
      emoji: '⚠️',
      barColor: 'bg-amber-400'
    };
    
    // Extreme Fear (0-29) - Rose
    return { 
      level: 'EXTREME FEAR', 
      color: 'text-rose-400',
      gradient: 'from-rose-600 to-pink-500',
      bg: 'from-rose-900/40 via-rose-900/30 to-rose-900/20',
      border: 'border-rose-500/50',
      glow: 'shadow-rose-500/50',
      intensity: 'bg-gradient-to-r from-rose-500 via-pink-400 to-fuchsia-400',
      emoji: '🔥',
      barColor: 'bg-rose-500'
    };
  }, []);

  // Memoized fetch function
  const fetchFearGreedIndex = useCallback(async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      
      if (data?.data?.[0]) {
        setFearGreedData(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized initial load with cleanup
  useEffect(() => {
    fetchFearGreedIndex();
    
    // Set up refresh interval (every 5 minutes)
    intervalRef.current = setInterval(fetchFearGreedIndex, 300000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchFearGreedIndex]);

  // Memoized level data
  const levelData = useMemo(() => {
    const value = fearGreedData?.value || '50';
    return getFearGreedLevel(value);
  }, [fearGreedData?.value, getFearGreedLevel]);

  // Memoized intensity bars - reduced from 10 to 6 for performance
  const intensityBars = useMemo(() => {
    if (!fearGreedData?.value) return null;
    
    const numValue = parseInt(fearGreedData.value);
    const bars = [];
    const barCount = 6; // Reduced from 10 for better performance
    
    for (let i = 0; i < barCount; i++) {
      const isActive = i < Math.floor(numValue / (100 / barCount));
      
      bars.push(
        <div
          key={i}
          className={`h-3 flex-1 rounded-lg transition-all duration-300 ${
            isActive 
              ? `${levelData.barColor} ${isHovered ? 'scale-y-125 shadow-lg' : 'shadow-md'}`
              : 'bg-slate-800/60'
          }`}
          style={{ 
            transitionDelay: `${i * 50}ms`,
          }}
        />
      );
    }
    return bars;
  }, [fearGreedData?.value, levelData.barColor, isHovered]);

  if (loading) {
    return (
      <div className="relative h-full">
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-5 h-full">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-700/60 rounded w-32"></div>
              <div className="w-8 h-8 bg-slate-700/60 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-16 bg-slate-700/60 rounded-xl"></div>
              <div className="flex space-x-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-3 flex-1 bg-slate-700/60 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-full group transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${levelData.bg} rounded-3xl transition-all duration-1000 ${
        isHovered ? 'opacity-80' : 'opacity-60'
      }`}></div>
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] rounded-3xl opacity-30"></div>

      {/* Main Card */}
      <div className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl 
        border ${levelData.border} p-5 h-full transition-all duration-500 ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      } ${levelData.glow}`}>
        
        {/* Minimal Decorative Elements - Reduced count */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-20"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-600/20 to-transparent blur rounded-lg"></div>
              <h3 className="relative font-bold text-base text-slate-200">
                Fear & Greed Index
              </h3>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border ${levelData.border} ${levelData.color}`}>
              LIVE
            </span>
          </div>
          <div className={`text-2xl transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`}>
            {levelData.emoji}
          </div>
        </div>
        
        {/* Main Content */}
        {fearGreedData && (
          <div className="relative z-10 space-y-6">
            {/* Value Display */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <div className={`text-4xl font-black ${levelData.color} transition-all duration-500 ${
                  isHovered ? 'scale-105' : ''
                }`}>
                  {fearGreedData.value}
                  <span className="text-xl opacity-60">/100</span>
                </div>
                <div className={`text-lg font-bold ${levelData.color} transition-all duration-300 ${
                  isHovered ? 'translate-x-2' : ''
                }`}>
                  {levelData.level}
                </div>
              </div>
              
              {/* Time Indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-400">
                  Updated {new Date(parseInt(fearGreedData.timestamp) * 1000).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            {/* Visual Indicator */}
            <div className="space-y-3">
              {/* Intensity Bars - Reduced to 6 bars */}
              <div className="flex gap-1">
                {intensityBars}
              </div>
              
              {/* Labels */}
              <div className="flex justify-between text-xs font-medium px-1">
                <span className="text-rose-400">FEAR</span>
                <span className="text-blue-400">NEUTRAL</span>
                <span className="text-emerald-400">GREED</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <div 
                  className={`h-2 rounded-full ${levelData.barColor} transition-all duration-700 ease-out ${
                    isHovered ? 'shadow-lg' : ''
                  }`}
                  style={{ width: `${fearGreedData.value}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent shimmer-slow"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span>Market Sentiment</span>
                <span>100</span>
              </div>
            </div>

            {/* Context Info */}
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  24h change: <span className={`font-semibold ${levelData.color}`}>
                    {fearGreedData.value_classification}
                  </span>
                </span>
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                  Real-time
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Corner Accents */}
        <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${levelData.color} 
          border-opacity-40 rounded-tr-xl transition-all duration-500 ${
          isHovered ? 'border-opacity-70' : ''
        }`}></div>
        <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${levelData.color} 
          border-opacity-40 rounded-bl-xl transition-all duration-500 ${
          isHovered ? 'border-opacity-70' : ''
        }`}></div>

        {/* Hover Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${levelData.gradient} opacity-0 rounded-3xl 
          transition-all duration-500 ${isHovered ? 'opacity-10' : ''}`}></div>
      </div>
    </div>
  );
};

export default CryptoFearGreedIndex;