import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchFinancialNews } from '../services/newsService';
import { NewsArticle } from '../types';

const LiveNewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Memoized news loading function
    const loadNews = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const newsData = await fetchFinancialNews();
            // Limit to 7 articles for compact view
            setNews(newsData.slice(0, 7));
            setLastUpdated(new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
            }));
        } catch (error) {
            console.error('Failed to fetch news:', error);
            setError('Failed to load latest news');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
        const interval = setInterval(loadNews, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, [loadNews]);

    // Memoized helper functions for performance
    const getSentimentColor = useCallback((sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'border-l-green-500 bg-green-500/5';
            case 'negative': return 'border-l-red-500 bg-red-500/5';
            default: return 'border-l-blue-500 bg-blue-500/5';
        }
    }, []);

    const getSourceColor = useCallback((source: string) => {
        switch (source) {
            case 'alphavantage': return 'bg-purple-500/10 text-purple-400';
            case 'coingecko': return 'bg-amber-500/10 text-amber-400';
            case 'finnhub': return 'bg-cyan-500/10 text-cyan-400';
            default: return 'bg-cyan-500/10 text-cyan-400';
        }
    }, []);

    const formatTime = useCallback((timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Now';
            if (diffMins < 60) return `${diffMins}m`;
            return `${Math.floor(diffMins / 60)}h`;
        } catch {
            return 'Now';
        }
    }, []);

    // Get source abbreviation
    const getSourceAbbr = useCallback((source: string) => {
        switch (source) {
            case 'alphavantage': return 'AV';
            case 'coingecko': return 'CG';
            case 'finnhub': return 'FH';
            default: return 'NEWS';
        }
    }, []);

    // Memoized news items for optimal rendering
    const newsItems = useMemo(() => (
        <div className="space-y-1.5 p-1">
            {news.map((article) => (
                <div
                    key={article.id}
                    className={`group p-2.5 rounded-lg border-l-2 ${getSentimentColor(article.sentiment || 'neutral')} hover:bg-gray-700/20 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-600/20`}
                    onClick={() => window.open(article.url, '_blank')}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                            {/* Compact Title */}
                            <h3 className="text-white text-xs font-medium leading-tight group-hover:text-cyan-100 transition-colors duration-200 line-clamp-2 mb-1">
                                {article.title}
                            </h3>
                            
                            {/* Ultra-Compact Meta Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                    {/* Source Badge */}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSourceColor(article.source)} font-semibold tracking-wide`}>
                                        {getSourceAbbr(article.source)}
                                    </span>
                                    
                                    {/* Category */}
                                    <span className="text-gray-400 text-[10px] font-medium capitalize">
                                        {article.category}
                                    </span>
                                </div>
                                
                                {/* Time */}
                                <span className="text-gray-500 text-[10px] font-mono whitespace-nowrap">
                                    {formatTime(article.publishedAt)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Sentiment Indicator */}
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                            article.sentiment === 'positive' ? 'bg-green-400' :
                            article.sentiment === 'negative' ? 'bg-red-400' : 'bg-blue-400'
                        }`} />
                    </div>
                </div>
            ))}
        </div>
    ), [news, getSentimentColor, getSourceColor, getSourceAbbr, formatTime]);

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-xl h-full flex flex-col">
            {/* Compact Professional Header */}
            <div className="p-3 border-b border-cyan-500/20 bg-gradient-to-r from-slate-800/80 to-slate-900/60">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full relative"></div>
                        </div>
                        <h2 className="text-sm font-bold text-white tracking-wide">LIVE NEWS</h2>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-[10px] font-semibold tracking-widest">LIVE</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Finnhub • Real-time</span>
                    {lastUpdated && (
                        <span className="text-cyan-400 text-xs font-mono">{lastUpdated}</span>
                    )}
                </div>
                
                {/* Error Banner */}
                {error && (
                    <div className="mt-1 p-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px]">{error}</span>
                    </div>
                )}
            </div>

            {/* Ultra-Compact News Content */}
            <div className="flex-1 min-h-0">
                <div className="h-full overflow-hidden hover:overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="space-y-2 p-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-slate-700 rounded mt-0.5"></div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-2.5 bg-slate-700 rounded w-full"></div>
                                            <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                                            <div className="flex space-x-2">
                                                <div className="h-1.5 bg-slate-700 rounded w-8"></div>
                                                <div className="h-1.5 bg-slate-700 rounded w-6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : news.length > 0 ? (
                        newsItems
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            <p className="text-xs text-center">No news available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="p-2 bg-slate-900/20 border-t border-cyan-500/10 rounded-b-xl">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={loadNews}
                        disabled={isLoading}
                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                    >
                        <svg className={`w-3 h-3 group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-[10px]">{isLoading ? 'UPDATING' : 'REFRESH'}</span>
                    </button>
                    <div className="text-gray-500 text-[10px] font-mono">
                        5m
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveNewsFeed;