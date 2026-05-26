import React, { useState, useEffect, useCallback } from 'react';
import { TradingTip } from '../types';
import { tradingTips } from '../data/TradingTips'; // ← ADD THIS LINE
const TradingTips: React.FC = () => {
  const [currentTips, setCurrentTips] = useState<TradingTip[]>([]);
  const [fade, setFade] = useState(false);

  const getRandomTips = useCallback(() => {
    const shuffled = [...tradingTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, []);

  const refreshTips = useCallback(() => {
    setFade(true);
    setTimeout(() => {
      setCurrentTips(getRandomTips());
      setFade(false);
    }, 300);
  }, [getRandomTips]);

  useEffect(() => {
    // Set initial tips
    setCurrentTips(getRandomTips());
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(refreshTips, 30000);
    
    return () => clearInterval(interval);
  }, [getRandomTips, refreshTips]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading': return 'from-cyan-500 to-blue-500';
      case 'investment': return 'from-green-500 to-emerald-500';
      case 'psychology': return 'from-purple-500 to-pink-500';
      case 'risk': return 'from-orange-500 to-red-500';
      case 'strategy': return 'from-indigo-500 to-purple-500';
      case 'technical': return 'from-amber-500 to-orange-500';
      case 'fundamental': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trading': return '🎯';
      case 'investment': return '💼';
      case 'psychology': return '🧠';
      case 'risk': return '⚠️';
      case 'strategy': return '📊';
      case 'technical': return '📈';
      case 'fundamental': return '🏛️';
      default: return '💡';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 p-3 md:p-4 lg:p-6 group hover:border-cyan-400/50 transition-all duration-500 h-full">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <h3 className="font-poppins font-bold text-base md:text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Trading Insights
          </h3>
        </div>
        
        {/* Auto-refresh Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-cyan-400/70 text-[10px] md:text-xs font-semibold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Tips Container */}
      <div className={`relative z-10 space-y-3 md:space-y-4 transition-all duration-300 ${fade ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {currentTips.map((tip, index) => (
          <div 
            key={tip.id}
            className="bg-slate-800/50 rounded-xl p-3 md:p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10 group/card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Category & Difficulty */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs md:text-sm">{getCategoryIcon(tip.category)}</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r ${getCategoryColor(tip.category)} bg-clip-text text-transparent border border-current/20`}>
                  {tip.category.toUpperCase()}
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] md:text-xs font-semibold ${getDifficultyColor(tip.difficulty)}`}>
                {tip.difficulty}
              </span>
            </div>

            {/* Tip Content */}
            <h4 className="font-semibold text-white text-sm md:text-base mb-1.5 md:mb-2 group-hover/card:text-cyan-300 transition-colors duration-300">
              {tip.title}
            </h4>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              {tip.content}
            </p>

            {/* Author */}
            {tip.author && (
              <div className="flex items-center space-x-2 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-700/50">
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-400/70 text-[10px] md:text-xs font-medium">{tip.author}</span>
              </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover/card:opacity-100 transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="relative z-10 flex justify-center mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-700/50">
        <button
          onClick={refreshTips}
          className="flex items-center space-x-2 min-h-[44px] px-3 md:px-4 py-1.5 md:py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 group/button"
        >
          <span className="text-xs md:text-sm font-semibold">Refresh Insights</span>
          <svg className="w-4 h-4 group-hover/button:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-3 right-3 w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
    </div>
  );
};

export default TradingTips;