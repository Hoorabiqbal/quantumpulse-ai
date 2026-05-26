import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserAnalytics, AnalyticsServiceResponse } from '../types';
import { analyticsService } from '../services/analyticsService';

interface UserAnalyticsDashboardProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const UserAnalyticsDashboard: React.FC<UserAnalyticsDashboardProps> = ({ 
  user, 
  isOpen, 
  onClose 
}) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response: AnalyticsServiceResponse = await analyticsService.getUserAnalytics(user.id);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to load analytics data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchAnalytics();
    }
  }, [isOpen, user?.id, fetchAnalytics]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    setAnalytics(null);
    setError(null);
    setLoading(true);
    onClose();
  }, [onClose]);

  // Compact sentiment calculations
  const sentimentData = useMemo(() => {
    if (!analytics) return null;
    
    const { sentimentDistribution, performanceMetrics } = analytics;
    const total = sentimentDistribution.bullish + sentimentDistribution.bearish + sentimentDistribution.neutral;
    
    return {
      bullish: {
        count: sentimentDistribution.bullish,
        percentage: total > 0 ? (sentimentDistribution.bullish / total) * 100 : 0
      },
      bearish: {
        count: sentimentDistribution.bearish,
        percentage: total > 0 ? (sentimentDistribution.bearish / total) * 100 : 0
      },
      neutral: {
        count: sentimentDistribution.neutral,
        percentage: total > 0 ? (sentimentDistribution.neutral / total) * 100 : 0
      },
      totalAnalyses: performanceMetrics.totalAnalyses,
      dominant: sentimentDistribution.bullish >= sentimentDistribution.bearish && 
                sentimentDistribution.bullish >= sentimentDistribution.neutral ? 'BULLISH' : 
                sentimentDistribution.bearish >= sentimentDistribution.bullish && 
                sentimentDistribution.bearish >= sentimentDistribution.neutral ? 'BEARISH' : 'NEUTRAL'
    };
  }, [analytics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-xl">
      {/* GLASS MORPHISM MODAL */}
      <div 
        className="relative w-full max-w-4xl h-[95vh] md:h-[90vh] bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* GLASS HEADER WITH NEON ACCENT */}
        <div className="relative flex items-center justify-between p-3 md:p-4 lg:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-bold text-base md:text-lg">📊</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 shadow-lg shadow-emerald-400/30"></div>
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Analytics Dashboard
              </h2>
              <p className="text-gray-400 text-[10px] md:text-sm font-medium">Real-time market insights</p>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-lg font-light hover:scale-110"
          >
            ×
          </button>
        </div>

        {/* SCROLLABLE CONTENT WITH DARK SCROLLBAR */}
        <div className="flex-1 overflow-auto p-3 md:p-4 lg:p-6 bg-gradient-to-b from-gray-900/50 to-gray-800/30">
          <div className="h-full custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4 shadow-lg shadow-cyan-500/20"></div>
                  <p className="text-cyan-400 text-xs md:text-sm font-medium tracking-wide">Loading market data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <span className="text-2xl text-red-400">⚠️</span>
                </div>
                <h3 className="text-red-400 font-semibold text-base md:text-lg mb-2">Data Error</h3>
                <p className="text-gray-400 text-xs md:text-sm mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
                <button
                  onClick={fetchAnalytics}
                  className="min-h-[44px] px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  Retry Connection
                </button>
              </div>
            ) : analytics && sentimentData ? (
              <div className="space-y-4 md:space-y-6">
                {/* SENTIMENT ANALYSIS CARD - MOVED TO TOP */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 p-3 md:p-4 lg:p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                      <h3 className="text-white font-semibold text-base md:text-lg mb-1">Market Sentiment</h3>
                      <p className="text-gray-400 text-[10px] md:text-sm font-medium">Live sentiment distribution</p>
                    </div>
                    <div className={`px-2 md:px-4 py-1 md:py-2 rounded-xl border backdrop-blur-sm font-semibold text-[10px] md:text-sm ${
                      sentimentData.dominant === 'BULLISH' 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : sentimentData.dominant === 'BEARISH'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                      {sentimentData.dominant}
                    </div>
                  </div>

                  {/* SENTIMENT METERS */}
                  <div className="space-y-3 md:space-y-5">
                    {/* BULLISH */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <div className="flex items-center gap-2 md:gap-3 w-auto sm:w-24">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow shadow-green-400/40"></div>
                        <span className="text-white font-semibold text-xs md:text-sm">Bullish</span>
                      </div>
                      <div className="flex-1 w-full max-w-md sm:ml-4">
                        <div className="flex justify-between text-[10px] md:text-sm text-gray-400 mb-1 md:mb-2 font-medium">
                          <span>{sentimentData.bullish.count} signals</span>
                          <span>{sentimentData.bullish.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 shadow shadow-green-400/30"
                            style={{ width: `${sentimentData.bullish.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* BEARISH */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <div className="flex items-center gap-2 md:gap-3 w-auto sm:w-24">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full shadow shadow-red-400/40"></div>
                        <span className="text-white font-semibold text-xs md:text-sm">Bearish</span>
                      </div>
                      <div className="flex-1 w-full max-w-md sm:ml-4">
                        <div className="flex justify-between text-[10px] md:text-sm text-gray-400 mb-1 md:mb-2 font-medium">
                          <span>{sentimentData.bearish.count} signals</span>
                          <span>{sentimentData.bearish.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full transition-all duration-500 shadow shadow-red-400/30"
                            style={{ width: `${sentimentData.bearish.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* NEUTRAL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <div className="flex items-center gap-2 md:gap-3 w-auto sm:w-24">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow shadow-blue-400/40"></div>
                        <span className="text-white font-semibold text-xs md:text-sm">Neutral</span>
                      </div>
                      <div className="flex-1 w-full max-w-md sm:ml-4">
                        <div className="flex justify-between text-[10px] md:text-sm text-gray-400 mb-1 md:mb-2 font-medium">
                          <span>{sentimentData.neutral.count} signals</span>
                          <span>{sentimentData.neutral.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow shadow-blue-400/30"
                            style={{ width: `${sentimentData.neutral.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SENTIMENT SUMMARY */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-700/50">
                    <div className="text-center p-2 md:p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:border-green-500/30 transition-all duration-200">
                      <div className="text-green-400 font-bold text-xl md:text-2xl mb-1">{sentimentData.bullish.count}</div>
                      <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide">BULLISH</div>
                    </div>
                    <div className="text-center p-2 md:p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:border-red-500/30 transition-all duration-200">
                      <div className="text-red-400 font-bold text-xl md:text-2xl mb-1">{sentimentData.bearish.count}</div>
                      <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide">BEARISH</div>
                    </div>
                    <div className="text-center p-2 md:p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:border-blue-500/30 transition-all duration-200">
                      <div className="text-blue-400 font-bold text-xl md:text-2xl mb-1">{sentimentData.neutral.count}</div>
                      <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide">NEUTRAL</div>
                    </div>
                  </div>
                </div>

                {/* MAIN DASHBOARD GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                  {/* USER PROFILE CARD */}
                  <div className="xl:col-span-1">
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 p-3 md:p-4 lg:p-6 backdrop-blur-sm shadow-xl h-full">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="relative">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-400 rounded-full border-2 border-gray-900 shadow-lg shadow-emerald-400/40"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-base md:text-lg truncate mb-0.5 md:mb-1">{user.name}</h3>
                          <p className="text-gray-400 text-[10px] md:text-sm truncate mb-1 md:mb-2">{user.email}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse shadow shadow-emerald-400/50"></div>
                            <span className="text-emerald-400 text-[10px] md:text-xs font-semibold tracking-wide">ACTIVE TRADER</span>
                          </div>
                        </div>
                      </div>

                      {/* COMPACT STATS */}
                      <div className="space-y-3 md:space-y-4">
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          <div className="bg-gray-800/40 rounded-xl p-3 md:p-4 text-center border border-gray-700/30 hover:border-cyan-500/30 transition-all duration-200">
                            <div className="text-white font-bold text-xl md:text-2xl mb-1">{analytics.performanceMetrics.totalAnalyses}</div>
                            <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide">ANALYSES</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-xl p-3 md:p-4 text-center border border-gray-700/30 hover:border-blue-500/30 transition-all duration-200">
                            <div className="text-cyan-400 font-bold text-xl md:text-2xl mb-1">{analytics.performanceMetrics.averageConfidence}%</div>
                            <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide">CONFIDENCE</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/30 rounded-xl p-3 md:p-4 border border-gray-700/40 hover:border-purple-500/30 transition-all duration-200">
                          <div className="text-gray-400 text-[10px] md:text-xs font-semibold tracking-wide mb-1">PEAK ACTIVITY</div>
                          <div className="text-white font-semibold text-sm md:text-base">{analytics.performanceMetrics.mostActivePeriod}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PERFORMANCE INSIGHTS */}
                  <div className="xl:col-span-2">
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 p-3 md:p-4 lg:p-6 backdrop-blur-sm shadow-xl h-full">
                      <h3 className="text-white font-semibold text-base md:text-lg mb-4 md:mb-6">Performance Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-gray-800/30 rounded-2xl p-4 md:p-5 text-center border border-gray-700/30 hover:border-cyan-500/30 transition-all duration-200 group">
                          <div className="text-cyan-400 text-xl md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200">🎯</div>
                          <div className="text-white font-semibold text-sm md:text-base mb-1">Accuracy Score</div>
                          <div className="text-cyan-400 text-xl md:text-2xl font-bold">{analytics.performanceMetrics.consistencyScore}%</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-2xl p-4 md:p-5 text-center border border-gray-700/30 hover:border-green-500/30 transition-all duration-200 group">
                          <div className="text-green-400 text-xl md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200">📈</div>
                          <div className="text-white font-semibold text-sm md:text-base mb-1">Market Trend</div>
                          <div className="text-green-400 text-lg md:text-xl font-bold">{sentimentData.dominant}</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-2xl p-4 md:p-5 text-center border border-gray-700/30 hover:border-purple-500/30 transition-all duration-200 group">
                          <div className="text-purple-400 text-xl md:text-2xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200">⚡</div>
                          <div className="text-white font-semibold text-sm md:text-base mb-1">Active Period</div>
                          <div className="text-purple-400 text-lg md:text-xl font-bold">{analytics.performanceMetrics.mostActivePeriod}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUICK STATS BAR */}
                <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 p-3 md:p-5 backdrop-blur-sm shadow-xl">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0 justify-between text-xs md:text-sm font-medium">
                    <div className="text-gray-400">
                      Total Signals: <span className="text-white font-semibold">{sentimentData.totalAnalyses}</span>
                    </div>
                    <div className="text-gray-400">
                      Dominant Sentiment: <span className="text-cyan-400 font-semibold">{sentimentData.dominant}</span>
                    </div>
                    <div className="text-gray-400">
                      Avg Confidence: <span className="text-emerald-400 font-semibold">{analytics.performanceMetrics.averageConfidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800/40 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50 shadow-xl">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-gray-300 font-semibold text-lg mb-2">No Analytics Data</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  Complete market analyses to unlock detailed insights and performance metrics
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GLASS FOOTER */}
        <div className="border-t border-gray-700/50 px-3 md:px-6 py-3 md:py-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-[10px] md:text-sm font-medium">
            <div className="text-gray-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              Live Analytics • Real-time Updates
            </div>
            <div className="text-gray-500 font-mono">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;