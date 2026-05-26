import React from 'react';
import { PerformanceMetrics, KeywordFrequency } from '../types';

interface TradingPerformanceProps {
  performanceMetrics: PerformanceMetrics;
  topKeywords: KeywordFrequency[];
}

const TradingPerformance: React.FC<TradingPerformanceProps> = ({ 
  performanceMetrics, 
  topKeywords 
}) => {
  const { 
    averageConfidence, 
    consistencyScore, 
    mostActivePeriod, 
    totalAnalyses 
  } = performanceMetrics;

  // Performance metrics cards data
  const metrics = [
    {
      title: 'Avg Confidence',
      value: `${averageConfidence}%`,
      description: 'Average prediction confidence',
      icon: '🎯',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
      progress: averageConfidence / 100
    },
    {
      title: 'Consistency',
      value: `${consistencyScore}%`,
      description: 'Analysis consistency score',
      icon: '📊',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      progress: consistencyScore / 100
    },
    {
      title: 'Active Period',
      value: mostActivePeriod,
      description: 'Most productive time',
      icon: '⏰',
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-gradient-to-r from-purple-400 to-indigo-500',
      progress: 0.7 // Static for non-numeric value
    },
    {
      title: 'Total Analyses',
      value: totalAnalyses.toString(),
      description: 'Lifetime analysis count',
      icon: '📈',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
      progress: Math.min(totalAnalyses / 100, 1) // Cap at 100% for visual
    }
  ];

  // Get performance level based on metrics
  const getPerformanceLevel = (): { level: string; color: string; description: string } => {
    const score = (averageConfidence + consistencyScore) / 2;
    
    if (score >= 80) return { 
      level: 'Expert', 
      color: 'text-green-400',
      description: 'Highly consistent and confident analysis' 
    };
    if (score >= 60) return { 
      level: 'Advanced', 
      color: 'text-blue-400',
      description: 'Solid analytical performance' 
    };
    if (score >= 40) return { 
      level: 'Intermediate', 
      color: 'text-yellow-400',
      description: 'Developing analytical skills' 
    };
    return { 
      level: 'Beginner', 
      color: 'text-orange-400',
      description: 'Starting analytical journey' 
    };
  };

  const performanceLevel = getPerformanceLevel();
  const hasData = totalAnalyses > 0;

  return (
    <div className="glassmorphism rounded-2xl p-3 md:p-4 lg:p-6 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-500 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
          <h3 className="font-poppins font-bold text-base md:text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Performance Metrics
          </h3>
        </div>
        
        {/* Performance Level Badge */}
        {hasData && (
          <div className={`px-2 md:px-3 py-1 md:py-1.5 flex items-center min-h-[44px] md:min-h-0 rounded-lg border ${performanceLevel.color.replace('text', 'border')}/30 bg-slate-800/80 backdrop-blur-sm`}>
            <span className={`text-xs md:text-sm font-semibold ${performanceLevel.color}`}>
              {performanceLevel.level}
            </span>
          </div>
        )}
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="relative p-3 md:p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group/card hover:scale-105 hover:border-slate-600/70 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover/card:opacity-10 transition-opacity duration-300 ${metric.bgColor}`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="text-xl md:text-2xl">{metric.icon}</div>
                  <div>
                    <div className="text-white font-semibold text-xs md:text-sm">
                      {metric.title}
                    </div>
                    <div className="text-slate-400 text-[10px] md:text-xs">
                      {metric.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="text-xl md:text-2xl font-bold text-white mb-2">
                {metric.value}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.bgColor} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${metric.progress * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full opacity-0 group-hover/card:opacity-30 animate-pulse"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-0 group-hover/card:opacity-20 animate-pulse delay-300"></div>
          </div>
        ))}
      </div>

      {/* Top Keywords Section */}
      <div className="border-t border-slate-700/50 pt-4 md:pt-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
          <h4 className="font-poppins font-semibold text-cyan-300 text-xs md:text-sm">
            Top Analysis Keywords
          </h4>
        </div>

        {topKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topKeywords.slice(0, 8).map((keyword, index) => (
              <div
                key={keyword.keyword}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 min-h-[44px] bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 group/keyword hover:scale-105"
              >
                <span className="text-white text-xs md:text-sm font-medium">
                  {keyword.keyword}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 text-[10px] md:text-xs font-bold">
                    {keyword.frequency}
                  </span>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover/keyword:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50">
              <span className="text-xl">🔍</span>
            </div>
            <p className="text-slate-500 text-xs md:text-sm">
              {hasData ? 'Keywords will appear as you analyze more content' : 'No analysis data available'}
            </p>
          </div>
        )}

        {/* Performance Insight */}
        {hasData && (
          <div className="mt-4 p-3 md:p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full mt-1.5 md:mt-2 animate-pulse"></div>
              <div>
                <div className="text-cyan-300 font-semibold text-xs md:text-sm mb-1">
                  Performance Insight
                </div>
                <div className="text-slate-300 text-xs md:text-sm">
                  {performanceLevel.description}
                </div>
                {totalAnalyses < 10 && (
                  <div className="text-amber-400 text-[10px] md:text-xs mt-2 font-medium">
                    💡 Complete more analyses for better insights
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
    </div>
  );
};

export default TradingPerformance;