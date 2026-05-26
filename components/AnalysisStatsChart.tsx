import React, { useMemo } from 'react';
import { SentimentDistribution } from '../types';

interface AnalysisStatsChartProps {
  sentimentDistribution: SentimentDistribution;
  totalAnalyses: number;
}

const AnalysisStatsChart: React.FC<AnalysisStatsChartProps> = ({ 
  sentimentDistribution, 
  totalAnalyses 
}) => {
  const { bullish, bearish, neutral } = sentimentDistribution;

  // Memoized calculations for performance
  const { bullishPercentage, bearishPercentage, neutralPercentage } = useMemo(() => ({
    bullishPercentage: totalAnalyses > 0 ? (bullish / totalAnalyses) * 100 : 0,
    bearishPercentage: totalAnalyses > 0 ? (bearish / totalAnalyses) * 100 : 0,
    neutralPercentage: totalAnalyses > 0 ? (neutral / totalAnalyses) * 100 : 0
  }), [bullish, bearish, neutral, totalAnalyses]);

  // Professional chart configuration
  const chartData = useMemo(() => [
    { 
      label: 'BULLISH', 
      value: bullish, 
      percentage: bullishPercentage, 
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
      textColor: 'text-green-400',
      borderColor: 'border-green-400/40',
      icon: '📈',
      trend: bullish > bearish ? 'rising' : 'stable'
    },
    { 
      label: 'BEARISH', 
      value: bearish, 
      percentage: bearishPercentage, 
      color: 'from-red-400 to-rose-500',
      bgColor: 'bg-gradient-to-r from-red-400 to-rose-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-400/40',
      icon: '📉',
      trend: bearish > bullish ? 'rising' : 'stable'
    },
    { 
      label: 'NEUTRAL', 
      value: neutral, 
      percentage: neutralPercentage, 
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-gradient-to-r from-cyan-400 to-blue-500',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-400/40',
      icon: '⚖️',
      trend: 'stable'
    }
  ], [bullish, bearish, neutral, bullishPercentage, bearishPercentage, neutralPercentage]);

  // Advanced radial chart calculations
  const radialConfig = useMemo(() => {
    const size = 140;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let currentOffset = 0;
    
    const getSegment = (percentage: number) => {
      const strokeDasharray = circumference;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      const segment = { strokeDasharray, strokeDashoffset: currentOffset };
      currentOffset -= (percentage / 100) * circumference;
      return segment;
    };

    return {
      size,
      strokeWidth,
      radius,
      circumference,
      segments: [
        getSegment(bullishPercentage),
        getSegment(bearishPercentage),
        getSegment(neutralPercentage)
      ]
    };
  }, [bullishPercentage, bearishPercentage, neutralPercentage]);

  const hasData = totalAnalyses > 0;

  // Get market outlook based on sentiment
  const marketOutlook = useMemo(() => {
    if (bullishPercentage > 60) return { type: 'STRONGLY BULLISH', color: 'text-green-400', icon: '🚀' };
    if (bullishPercentage > bearishPercentage) return { type: 'BULLISH', color: 'text-green-300', icon: '📈' };
    if (bearishPercentage > bullishPercentage) return { type: 'BEARISH', color: 'text-red-400', icon: '📉' };
    return { type: 'NEUTRAL', color: 'text-cyan-400', icon: '⚖️' };
  }, [bullishPercentage, bearishPercentage]);

  return (
    <div className="rounded-2xl p-5 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-500 group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-blue-500/2 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>

      {/* Professional Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute -inset-1 bg-cyan-400/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="font-poppins font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            SENTIMENT PROFILE
          </h3>
        </div>
        
        {/* Professional Total Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-600/50 group/total hover:border-cyan-500/40 transition-all duration-300">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-cyan-300 text-sm font-semibold font-mono">
            {totalAnalyses}
          </span>
          <span className="text-slate-400 text-xs">ANALYSES</span>
        </div>
      </div>

      {/* Compact Professional Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Enhanced Radial Chart - Left Column */}
        <div className="lg:col-span-2">
          <div className="relative flex items-center justify-center">
            {/* Advanced Radial Chart */}
            <svg width={radialConfig.size} height={radialConfig.size} className="transform -rotate-90 drop-shadow-2xl">
              <defs>
                <linearGradient id="professionalBullish" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="professionalBearish" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="professionalNeutral" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                
                {/* Glow Effects */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background Track */}
              <circle
                cx={radialConfig.size / 2}
                cy={radialConfig.size / 2}
                r={radialConfig.radius}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth={radialConfig.strokeWidth}
                fill="none"
                className="drop-shadow-lg"
              />

              {/* Data Segments with Animation */}
              {hasData ? (
                <>
                  {/* Bullish Segment */}
                  <circle
                    cx={radialConfig.size / 2}
                    cy={radialConfig.size / 2}
                    r={radialConfig.radius}
                    stroke="url(#professionalBullish)"
                    strokeWidth={radialConfig.strokeWidth}
                    strokeDasharray={radialConfig.segments[0].strokeDasharray}
                    strokeDashoffset={radialConfig.segments[0].strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Bearish Segment */}
                  <circle
                    cx={radialConfig.size / 2}
                    cy={radialConfig.size / 2}
                    r={radialConfig.radius}
                    stroke="url(#professionalBearish)"
                    strokeWidth={radialConfig.strokeWidth}
                    strokeDasharray={radialConfig.segments[1].strokeDasharray}
                    strokeDashoffset={radialConfig.segments[1].strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="transition-all duration-1000 ease-out delay-150"
                  />
                  
                  {/* Neutral Segment */}
                  <circle
                    cx={radialConfig.size / 2}
                    cy={radialConfig.size / 2}
                    r={radialConfig.radius}
                    stroke="url(#professionalNeutral)"
                    strokeWidth={radialConfig.strokeWidth}
                    strokeDasharray={radialConfig.segments[2].strokeDasharray}
                    strokeDashoffset={radialConfig.segments[2].strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="transition-all duration-1000 ease-out delay-300"
                  />
                </>
              ) : (
                <circle
                  cx={radialConfig.size / 2}
                  cy={radialConfig.size / 2}
                  r={radialConfig.radius}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth={radialConfig.strokeWidth}
                  strokeDasharray="20 10"
                  fill="none"
                />
              )}
            </svg>

            {/* Enhanced Center Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1 font-mono">
                  {hasData ? totalAnalyses : '0'}
                </div>
                <div className="text-xs text-slate-400 font-semibold tracking-wide">
                  TOTAL
                </div>
                {hasData && (
                  <div className={`text-xs font-bold mt-1 ${marketOutlook.color} flex items-center justify-center gap-1`}>
                    <span>{marketOutlook.icon}</span>
                    <span>{marketOutlook.type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Compact Stats - Right Column */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 group/item hover:scale-105 hover:bg-slate-800/30 relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 ${item.bgColor} opacity-0 group-hover/item:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="flex items-center gap-3 flex-1">
                  {/* Enhanced Color Indicator */}
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                    <div className={`absolute -inset-1 ${item.bgColor} rounded-full opacity-0 group-hover/item:opacity-30 blur-sm transition-opacity duration-300`}></div>
                  </div>
                  
                  {/* Enhanced Label with Icon */}
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className={`text-sm font-bold ${item.textColor} tracking-wide`}>
                        {item.label}
                      </div>
                      <div className="text-slate-400 text-xs font-medium">
                        {item.percentage.toFixed(1)}% of portfolio
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Values with Progress */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white font-bold text-sm font-mono">
                      {item.value}
                    </div>
                    <div className="text-slate-400 text-xs font-mono">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Professional Progress Bar */}
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${item.bgColor} rounded-full transition-all duration-1000 ease-out relative`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 shimmer-animation"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Professional Insights */}
          {hasData && (
            <div className="mt-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group/insights">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center group/item">
                  <div className="text-green-400 font-bold text-xs tracking-wide mb-1 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    DOMINANT SENTIMENT
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {bullish >= bearish && bullish >= neutral ? 'BULLISH' : 
                     bearish >= bullish && bearish >= neutral ? 'BEARISH' : 'NEUTRAL'}
                  </div>
                </div>
                <div className="text-center group/item">
                  <div className="text-cyan-400 font-bold text-xs tracking-wide mb-1 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                    MARKET BIAS
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {bullish > bearish ? 'OPTIMISTIC' : 
                     bearish > bullish ? 'CAUTIOUS' : 'BALANCED'}
                  </div>
                </div>
              </div>
              
              {/* Performance Indicator */}
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Confidence Level</span>
                  <span className="text-green-400 font-semibold">
                    {Math.max(bullishPercentage, bearishPercentage, neutralPercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced No Data State */}
      {!hasData && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</span>
          </div>
          <h4 className="text-slate-300 font-semibold mb-2">Awaiting Market Data</h4>
          <p className="text-slate-500 text-sm">
            Begin analysis to unlock sentiment insights
          </p>
        </div>
      )}

      {/* Custom CSS Animation - Moved to global or inline style tag without jsx */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .shimmer-animation {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalysisStatsChart;