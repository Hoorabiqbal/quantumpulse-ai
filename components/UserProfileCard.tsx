import React, { useMemo } from 'react';
import { User, UserAnalytics } from '../types';

interface UserProfileCardProps {
  user: User;
  analytics: UserAnalytics;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, analytics }) => {
  const { performanceMetrics, sentimentDistribution } = analytics;
  const { totalAnalyses, averageConfidence, consistencyScore } = performanceMetrics;
  const { bullish, bearish, neutral } = sentimentDistribution;

  // Memoized calculations for performance
  const userStats = useMemo(() => {
    const totalSentiments = bullish + bearish + neutral;
    const dominantSentiment = bullish >= bearish && bullish >= neutral ? 'bullish' : 
                             bearish >= bullish && bearish >= neutral ? 'bearish' : 'neutral';
    
    // Enhanced sentiment trend analysis
    const sentimentTrend = (() => {
      if (bullish > bearish && bullish > neutral) {
        return { trend: 'BULLISH BIAS', color: 'text-green-400', icon: '🚀', bg: 'from-green-500/15 to-emerald-500/10' };
      } else if (bearish > bullish && bearish > neutral) {
        return { trend: 'CAUTIOUS', color: 'text-amber-400', icon: '🛡️', bg: 'from-amber-500/15 to-orange-500/10' };
      } else {
        return { trend: 'BALANCED', color: 'text-cyan-400', icon: '⚖️', bg: 'from-cyan-500/15 to-blue-500/10' };
      }
    })();

    // User level with professional tiers
    const userLevel = (() => {
      if (totalAnalyses >= 100) return { level: 'QUANTUM ANALYST', icon: '🏆', color: 'from-purple-500 to-pink-500' };
      if (totalAnalyses >= 50) return { level: 'SENIOR ANALYST', icon: '⭐', color: 'from-amber-500 to-orange-500' };
      if (totalAnalyses >= 25) return { level: 'PROFESSIONAL', icon: '📈', color: 'from-blue-500 to-cyan-500' };
      if (totalAnalyses >= 10) return { level: 'INTERMEDIATE', icon: '🎯', color: 'from-green-500 to-emerald-500' };
      return { level: 'APPRENTICE', icon: '🌱', color: 'from-slate-500 to-slate-600' };
    })();

    return {
      totalSentiments,
      dominantSentiment,
      sentimentTrend,
      userLevel,
      bullishPercentage: totalSentiments > 0 ? (bullish / totalSentiments) * 100 : 0,
      bearishPercentage: totalSentiments > 0 ? (bearish / totalSentiments) * 100 : 0,
      neutralPercentage: totalSentiments > 0 ? (neutral / totalSentiments) * 100 : 0
    };
  }, [bullish, bearish, neutral, totalAnalyses]);

  // Memoized user join date
  const joinDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  // Professional user initials
  const getUserInitials = useMemo(() => {
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user.name]);

  const hasAnalyses = totalAnalyses > 0;

  // Helper function to get border color class dynamically
  const getSentimentBorderClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'text-green-400': 'border-green-500/30',
      'text-amber-400': 'border-amber-500/30',
      'text-cyan-400': 'border-cyan-500/30'
    };
    return colorMap[color] || 'border-cyan-500/30';
  };

  return (
    <div className="glassmorphism rounded-2xl p-3 md:p-4 lg:p-5 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-500 group relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-blue-500/2 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>

      {/* Compact Professional Header */}
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Enhanced User Avatar */}
          <div className="relative group/avatar">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-2xl shadow-cyan-500/40 transform transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:rotate-3">
              {getUserInitials}
            </div>
            
            {/* Enhanced Online Status */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-slate-900 shadow-lg shadow-green-400/40">
              <div className="w-full h-full bg-green-400 rounded-full animate-ping absolute"></div>
            </div>
            
            {/* Avatar Glow */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>

          {/* Enhanced User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg font-bold text-white truncate mb-1 tracking-wide">
              {user.name}
            </h2>
            <p className="text-slate-400 text-[10px] md:text-xs truncate mb-1 md:mb-2 font-mono">
              {user.email}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-[10px] md:text-xs font-semibold tracking-wide">
                LIVE SESSION
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Join Date */}
        <div className="text-right">
          <div className="text-slate-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 tracking-wide">
            MEMBER SINCE
          </div>
          <div className="text-white text-xs md:text-sm font-semibold font-mono">
            {joinDate}
          </div>
        </div>
      </div>

      {/* Professional Stats Grid - More Compact */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-5">
        {/* Total Analyses */}
        <div className="bg-slate-800/50 rounded-xl p-2 md:p-3 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 group/stat relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center relative z-10">
            <div className="text-lg md:text-xl font-bold text-white mb-1 font-mono">
              {totalAnalyses}
            </div>
            <div className="text-slate-400 text-[10px] md:text-xs font-medium tracking-wide">
              ANALYSES
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalAnalyses / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="bg-slate-800/50 rounded-xl p-2 md:p-3 border border-slate-700/50 hover:border-green-500/40 transition-all duration-300 group/stat relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center relative z-10">
            <div className="text-lg md:text-xl font-bold text-white mb-1 font-mono">
              {averageConfidence}%
            </div>
            <div className="text-slate-400 text-[10px] md:text-xs font-medium tracking-wide">
              CONFIDENCE
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${averageConfidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sentiment Profile */}
      <div className="border-t border-slate-700/50 pt-4 md:pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-cyan-300 text-xs md:text-sm tracking-wide">
            SENTIMENT PROFILE
          </h3>
          <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl bg-gradient-to-r ${userStats.sentimentTrend.bg} border ${getSentimentBorderClass(userStats.sentimentTrend.color)}`}>
            <span className={userStats.sentimentTrend.color}>{userStats.sentimentTrend.icon}</span>
            <span className={`text-[10px] md:text-xs font-bold ${userStats.sentimentTrend.color} tracking-wide`}>
              {userStats.sentimentTrend.trend}
            </span>
          </div>
        </div>

        {hasAnalyses ? (
          <div className="space-y-2 md:space-y-3">
            {/* Enhanced Sentiment Bars */}
            <div className="space-y-1.5 md:space-y-2.5">
              {/* Bullish Bar */}
              <div className="flex items-center justify-between group/bar">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-400/40"></div>
                  <span className="text-white text-[10px] md:text-xs font-semibold tracking-wide">BULLISH</span>
                  <span className="text-green-400 text-[10px] md:text-xs font-bold font-mono ml-auto">
                    {userStats.bullishPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-12 md:w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 relative shimmer-animation"
                    style={{ width: `${userStats.bullishPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
                  </div>
                </div>
              </div>

              {/* Bearish Bar */}
              <div className="flex items-center justify-between group/bar">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-lg shadow-red-400/40"></div>
                  <span className="text-white text-[10px] md:text-xs font-semibold tracking-wide">BEARISH</span>
                  <span className="text-red-400 text-[10px] md:text-xs font-bold font-mono ml-auto">
                    {userStats.bearishPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-12 md:w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-1000 relative shimmer-animation"
                    style={{ width: `${userStats.bearishPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
                  </div>
                </div>
              </div>

              {/* Neutral Bar */}
              <div className="flex items-center justify-between group/bar">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/40"></div>
                  <span className="text-white text-[10px] md:text-xs font-semibold tracking-wide">NEUTRAL</span>
                  <span className="text-cyan-400 text-[10px] md:text-xs font-bold font-mono ml-auto">
                    {userStats.neutralPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-12 md:w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 relative shimmer-animation"
                    style={{ width: `${userStats.neutralPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-1.5 md:p-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:border-green-500/40 transition-all duration-300 group/stat">
                <div className="text-green-400 font-bold text-xs md:text-sm font-mono">{bullish}</div>
                <div className="text-slate-400 text-[10px] md:text-xs tracking-wide">BULL</div>
              </div>
              <div className="text-center p-1.5 md:p-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:border-red-500/40 transition-all duration-300 group/stat">
                <div className="text-red-400 font-bold text-xs md:text-sm font-mono">{bearish}</div>
                <div className="text-slate-400 text-[10px] md:text-xs tracking-wide">BEAR</div>
              </div>
              <div className="text-center p-1.5 md:p-2 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 group/stat">
                <div className="text-cyan-400 font-bold text-xs md:text-sm font-mono">{neutral}</div>
                <div className="text-slate-400 text-[10px] md:text-xs tracking-wide">NEUTRAL</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50 group">
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">📊</span>
            </div>
            <h4 className="text-slate-300 font-semibold mb-2 text-sm">AWAITING DATA</h4>
            <p className="text-slate-500 text-xs">
              Begin market analysis to build profile
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Professional Level Badge */}
      {hasAnalyses && (
        <div className="mt-3 md:mt-4 p-2.5 md:p-3 bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300 group/level">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-cyan-300 font-semibold text-[10px] md:text-xs tracking-wide mb-0.5 md:mb-1">
                ANALYTICS TIER
              </div>
              <div className="text-white text-xs md:text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {userStats.userLevel.level}
              </div>
            </div>
            <div className="text-xl md:text-2xl transform transition-transform duration-300 group-hover/level:scale-110 group-hover/level:rotate-12">
              {userStats.userLevel.icon}
            </div>
          </div>
          
          {/* Progress to next level */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span className="font-mono">{totalAnalyses}/100</span>
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalAnalyses / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics Footer */}
      {hasAnalyses && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="grid grid-cols-2 gap-2 md:gap-3 text-[10px] md:text-xs">
            <div className="text-center">
              <div className="text-green-400 font-bold">CONSISTENCY</div>
              <div className="text-white font-semibold font-mono">{consistencyScore}%</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">ACTIVITY</div>
              <div className="text-white font-semibold">{performanceMetrics.mostActivePeriod}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;