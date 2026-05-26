import React, { useState, useMemo, memo, useCallback } from 'react';
import { HistoryEntry, Analysis, User, GuestAnalysis } from '../types';
import { DownloadIcon } from './icons';
import { analysisService } from '../services/analysisService';

interface HistoryLogProps {
  analyses: Analysis[]; // Only recent 10 analyses from App.tsx
  user: User | null;
}

const sentimentConfig = {
  bullish: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    icon: '📈'
  },
  bearish: {
    color: 'text-rose-400', 
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/40',
    gradient: 'from-rose-500/10 to-rose-500/5',
    icon: '📉'
  },
  neutral: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/40',
    gradient: 'from-cyan-500/10 to-cyan-500/5',
    icon: '⚖️'
  }
};

// Helper function to get unique ID from analysis (works for both Analysis and GuestAnalysis)
const getAnalysisId = (item: Analysis | GuestAnalysis): string => {
  if ('local_id' in item && item.local_id) {
    return item.local_id;
  }
  return item.id || 'unknown';
};

// Helper to check if analysis is guest
const isGuestAnalysis = (item: Analysis | GuestAnalysis): boolean => {
  return 'is_guest' in item && item.is_guest === true;
};

// ✅ PREMIUM PROFESSIONAL HEADER DESIGN
const HistoryLog: React.FC<HistoryLogProps> = memo(({ analyses, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [displayMode, setDisplayMode] = useState<'recent' | 'search'>('recent');
  const [searchResults, setSearchResults] = useState<(Analysis | GuestAnalysis)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  // ✅ RECENT ACTIVITY DATA (from App.tsx - already limited to 10)
  const recentData = analyses;

  // ✅ HANDLE SEARCH - Fetches ALL data when searching
  const handleSearch = useCallback(async (searchText: string) => {
    setSearchTerm(searchText);
    
    if (!searchText.trim()) {
      // Empty search → go back to recent mode
      setDisplayMode('recent');
      setSearchResults([]);
      setSearchCount(0);
      return;
    }

    setIsSearching(true);
    setDisplayMode('search');

    try {
      console.log('🔍 Searching in ALL analyses for:', searchText);
      
      // 🎯 CRITICAL: Fetch ALL analyses for search
      const result = await analysisService.getAnalyses(user);
      
      if (result.success && result.data) {
        const filtered = result.data.filter(item => {
          // Search in news_text
          const textMatch = item.news_text?.toLowerCase().includes(searchText.toLowerCase()) || false;
          
          // Search in sentiment
          const sentimentMatch = item.sentiment?.toLowerCase().includes(searchText.toLowerCase()) || false;
          
          // Search in keywords
          const keywordMatch = item.keywords?.some(keyword => 
            keyword.toLowerCase().includes(searchText.toLowerCase())
          ) || false;
          
          return textMatch || sentimentMatch || keywordMatch;
        }).slice(0, 50); // Limit search results to 50

        console.log(`✅ Found ${filtered.length} matches in ${result.data.length} total analyses`);
        setSearchResults(filtered);
        setSearchCount(filtered.length);
      } else {
        console.error('❌ Search failed:', result.error);
        setSearchResults([]);
        setSearchCount(0);
      }
    } catch (error) {
      console.error('❌ Error during search:', error);
      setSearchResults([]);
      setSearchCount(0);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // ✅ CURRENT DISPLAY DATA (depends on mode)
  const currentData = useMemo(() => {
    if (displayMode === 'search') {
      return searchResults;
    }
    return recentData;
  }, [displayMode, recentData, searchResults]);

  // ✅ OPTIMIZED: Filtering with useMemo
  const filteredData = useMemo(() => {
    return currentData
      .filter(item => {
        // Apply sentiment filter
        if (sentimentFilter !== 'All' && item.sentiment?.toLowerCase() !== sentimentFilter.toLowerCase()) {
          return false;
        }
        
        // Apply source filter
        if (sourceFilter !== 'All') {
          const isGuest = isGuestAnalysis(item);
          if (sourceFilter === 'User' && isGuest) return false;
          if (sourceFilter === 'Guest' && !isGuest) return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [currentData, sentimentFilter, sourceFilter]);

  // ✅ OPTIMIZED: Download handlers
  const downloadJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `quantumpulse_${displayMode}_analysis.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [filteredData, displayMode]);

  const downloadCSV = useCallback(() => {
    const headers = "id,timestamp,text,sentiment,confidence,keywords,source,user";
    const rows = filteredData.map(item => {
      const itemId = getAnalysisId(item);
      const isGuest = isGuestAnalysis(item);
      return [
        itemId,
        `"${item.created_at}"`,
        `"${(item.news_text || '').replace(/"/g, '""')}"`,
        item.sentiment,
        item.confidence,
        `"${(item.keywords || []).join(', ')}"`,
        isGuest ? 'guest' : 'user',
        user?.email || 'guest'
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quantumpulse_${displayMode}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [filteredData, user, displayMode]);

  const formatTimeAgo = useCallback((timestamp: string) => {
    const time = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }, []);

  // Truncate text for compact display
  const truncateText = (text: string, maxLength: number = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Clear search and return to recent mode
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDisplayMode('recent');
    setSearchResults([]);
    setSearchCount(0);
  }, []);

  return (
    <section className="w-full p-3 md:p-4 lg:p-6">
      {/* PREMIUM PROFESSIONAL HEADER */}
      <div className="bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 shadow-2xl shadow-cyan-500/10">
        <div className="text-center">
          {/* Main Title - Commanding Presence */}
          <div className="relative inline-block mb-3 md:mb-4">
            <h1 className="font-poppins text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight mb-2">
              {displayMode === 'recent' ? 'RECENT ACTIVITY' : 'SEARCH RESULTS'}
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg shadow-cyan-500/30"></div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 md:w-16 h-0.5 bg-cyan-400/30 rounded-full blur-sm"></div>
          </div>
          
          {/* Professional Stats Row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mb-4 md:mb-6">
            {/* Records Count */}
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20 w-full md:w-auto justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 font-bold text-xs md:text-sm tracking-wide">
                  {displayMode === 'recent' ? 'RECENT' : 'RESULTS'}
                </span>
              </div>
              <div className="w-px h-4 bg-cyan-500/40"></div>
              <span className="text-white font-black text-sm md:text-lg lg:text-lg">{filteredData.length}</span>
              {displayMode === 'search' && searchCount > 0 && (
                <span className="text-cyan-300 text-[10px] md:text-xs ml-2">
                  ({searchCount} total found)
                </span>
              )}
            </div>
            
            {/* User Status */}
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/20 w-full md:w-auto justify-center hidden md:flex">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 font-bold text-xs md:text-sm tracking-wide">MODE</span>
              </div>
              <div className="w-px h-4 bg-emerald-500/40"></div>
              <span className="text-white font-semibold text-xs md:text-sm">
                {displayMode === 'recent' ? 'RECENT 10' : 'SEARCH'}
              </span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-700/50 rounded-lg border border-slate-600/50 w-full md:w-auto justify-center hidden md:flex">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                displayMode === 'recent' ? 'bg-green-400' : 'bg-cyan-400'
              }`}></div>
              <span className={`font-semibold text-xs tracking-wider ${
                displayMode === 'recent' ? 'text-green-400' : 'text-cyan-400'
              }`}>
                {displayMode === 'recent' ? 'LIVE' : 'SEARCH'}
              </span>
            </div>
          </div>

          {/* Advanced Search & Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-3 md:gap-4 lg:gap-6">
            {/* Professional Search */}
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur-sm opacity-50"></div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="🔍 Search ALL analysis history..."
                  className="w-full min-h-[44px] bg-slate-900/80 backdrop-blur-sm border-2 border-slate-600/50 rounded-xl px-3 md:px-5 py-2 md:py-3 text-sm md:text-base lg:text-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:shadow-2xl focus:shadow-cyan-500/20 transition-all duration-300 font-medium"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors duration-200"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {displayMode === 'search' && isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 text-center">
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs md:text-sm lg:text-base">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching through all analyses...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Professional Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
              <select
                className="bg-slate-900/80 min-h-[44px] backdrop-blur-sm border-2 border-slate-600/50 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base lg:text-lg text-slate-200 focus:outline-none focus:border-emerald-400/60 focus:shadow-2xl focus:shadow-emerald-500/20 transition-all duration-300 font-medium cursor-pointer w-full md:min-w-[160px] lg:w-auto appearance-none"
                onChange={(e) => setSentimentFilter(e.target.value)}
                value={sentimentFilter}
              >
                <option className="bg-slate-800" value="All">All Sentiments</option>
                <option className="bg-slate-800" value="bullish">Bullish 📈</option>
                <option className="bg-slate-800" value="bearish">Bearish 📉</option>
                <option className="bg-slate-800" value="neutral">Neutral ⚖️</option>
              </select>

              <select
                className="bg-slate-900/80 min-h-[44px] backdrop-blur-sm border-2 border-slate-600/50 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base lg:text-lg text-slate-200 focus:outline-none focus:border-purple-400/60 focus:shadow-2xl focus:shadow-purple-500/20 transition-all duration-300 font-medium cursor-pointer w-full md:min-w-[160px] lg:w-auto appearance-none"
                onChange={(e) => setSourceFilter(e.target.value)}
                value={sourceFilter}
              >
                <option className="bg-slate-800" value="All">All Sources</option>
                <option className="bg-slate-800" value="User">User 👤</option>
                <option className="bg-slate-800" value="Guest">Guest 👥</option>
              </select>

              {/* Premium Export Button */}
              <button 
                onClick={downloadCSV}
                disabled={filteredData.length === 0}
                className="flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 min-h-[44px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 font-bold rounded-xl border-2 border-cyan-500/40 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full md:w-auto text-xs md:text-sm lg:text-base"
              >
                <DownloadIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="tracking-wide">EXPORT</span>
              </button>
            </div>
          </div>

          {/* Mode Indicator */}
          <div className="mt-4 md:mt-6 flex justify-center">
            <div className="inline-flex flex-col md:flex-row w-full md:w-auto rounded-xl bg-slate-800/60 border border-slate-700/50 p-1">
              <button
                onClick={() => {
                  setDisplayMode('recent');
                  setSearchTerm('');
                }}
                className={`px-3 md:px-4 py-2 min-h-[44px] rounded-lg text-xs md:text-sm lg:text-base font-medium transition-all duration-300 ${
                  displayMode === 'recent'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 Recent Activity
              </button>
              <button
                onClick={() => {
                  if (searchTerm) {
                    setDisplayMode('search');
                  }
                }}
                className={`px-3 md:px-4 py-2 min-h-[44px] rounded-lg text-xs md:text-sm lg:text-base font-medium transition-all duration-300 ${
                  displayMode === 'search'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                disabled={!searchTerm}
              >
                🔍 Search Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL ANALYSIS LIST */}
      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        {filteredData.length > 0 ? filteredData.map((item) => {
          const normalizedSentiment = (item.sentiment || 'neutral').toLowerCase() as keyof typeof sentimentConfig;
          const config = sentimentConfig[normalizedSentiment] || sentimentConfig.neutral;
          const isGuest = isGuestAnalysis(item);
          const source = isGuest ? 'guest' : 'user';
          const itemId = getAnalysisId(item);
          
          return (
            <div 
              key={itemId}
              className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 md:p-4 lg:p-6 hover:bg-slate-700/40 hover:border-slate-600/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4 lg:gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-slate-200 text-xs md:text-sm lg:text-base leading-relaxed mb-2 md:mb-3 font-light">
                    {truncateText(item.news_text, 100)}
                  </p>
                  
                  {/* Advanced Metadata Row */}
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span className={`text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-lg ${config.bg} ${config.color} border ${config.border} flex items-center gap-1 md:gap-1.5`}>
                      <span className="text-[10px] md:text-xs">{config.icon}</span>
                      {item.sentiment}
                    </span>
                    
                    <span className="text-[10px] md:text-xs text-slate-300 bg-slate-700/60 px-2 md:px-2.5 py-1 rounded-lg border border-slate-600/50">
                      {item.confidence}% confidence
                    </span>
                    
                    <span className="text-[10px] md:text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded border border-slate-700/50">
                      {formatTimeAgo(item.created_at)}
                    </span>

                    {item.keywords && item.keywords.length > 0 && (
                      <span className="text-[10px] md:text-xs text-slate-500 bg-slate-800/40 px-2 py-1 rounded border border-slate-700/40">
                        {item.keywords.slice(0, 2).join(', ')}
                        {item.keywords.length > 2 && ` +${item.keywords.length - 2}`}
                      </span>
                    )}

                    {/* Display Mode Badge */}
                    <span className={`text-[10px] md:text-xs px-2 py-1 rounded border ${
                      displayMode === 'search' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {displayMode === 'search' ? '🔍 Found' : '📋 Recent'}
                    </span>
                  </div>
                </div>

                {/* Source Badge */}
                <div className="flex items-center gap-2 md:ml-3 shrink-0 self-start md:self-auto">
                  <span className={`text-[10px] md:text-xs px-2 md:px-2.5 py-1 rounded-lg border ${
                    source === 'user' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {source === 'user' ? '👤 User' : '👥 Guest'}
                  </span>
                </div>
              </div>
            </div>
          );
        }) : (
          /* PROFESSIONAL EMPTY STATE */
          <div className="text-center py-16 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
            <div className="text-5xl mb-4 opacity-40">
              {displayMode === 'search' ? '🔍' : '📊'}
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-3 font-poppins">
              {displayMode === 'search' ? 'No Search Results Found' : 'No Analysis Data Available'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              {displayMode === 'search' 
                ? "Try different search terms or clear search to see recent activity"
                : user 
                  ? "Begin analyzing market data to build your comprehensive analysis history"
                  : "Sign in to access permanent analysis storage and advanced features"
              }
            </p>
            {displayMode === 'search' && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600/50 text-slate-300 text-sm transition-all duration-300 hover:scale-105"
              >
                ← Back to Recent Activity
              </button>
            )}
          </div>
        )}
      </div>

      {/* PROFESSIONAL FOOTER */}
      {filteredData.length > 0 && (
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-700/30">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs md:text-sm lg:text-base gap-2">
            <span className="text-slate-400 font-medium text-center md:text-left">
              QuantumPulse Analytics Platform • {displayMode === 'recent' ? 'Showing Recent 10' : 'Showing Search Results'}
            </span>
            <span className="text-slate-500 text-[10px] md:text-xs font-semibold tracking-wide">INSTITUTIONAL GRADE</span>
          </div>
        </div>
      )}
    </section>
  );
});

export default HistoryLog;