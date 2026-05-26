import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMarketData } from '../services/marketDataService';
import { MarketData } from '../types';
import MarketCard from './MarketCard';

// Constants for better maintainability
const UPDATE_INTERVAL = 240000; // 4 minutes in milliseconds
const COUNTDOWN_DURATION = 240; // 4 minutes in seconds

// Crypto and stock tickers for filtering
const CRYPTO_TICKERS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC'];
const STOCK_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'JPM', 'V'];

const MarketDashboard: React.FC = () => {
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeUntilUpdate, setTimeUntilUpdate] = useState(COUNTDOWN_DURATION);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchMarketData();
            setMarketData(data);
            setTimeUntilUpdate(COUNTDOWN_DURATION);
        } catch (error) {
            console.error('Failed to fetch market data:', error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, [loadData]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimeUntilUpdate(prev => prev > 0 ? prev - 1 : COUNTDOWN_DURATION);
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const { cryptoData, stockData, displayedAssets, bullishCount, bearishCount, neutralCount, totalChange, marketSentiment } = useMemo(() => {
        const cryptoData = marketData.filter(d => CRYPTO_TICKERS.includes(d.ticker));
        const stockData = marketData.filter(d => STOCK_TICKERS.includes(d.ticker));
        const displayedAssets = [...cryptoData, ...stockData];
        const bullishCount = displayedAssets.filter(d => d.change > 0).length;
        const bearishCount = displayedAssets.filter(d => d.change < 0).length;
        const neutralCount = displayedAssets.filter(d => d.change === 0).length;
        const totalChange = displayedAssets.reduce((sum, asset) => sum + (asset.change || 0), 0);
        const marketSentiment = totalChange > 0 ? 'bullish' : totalChange < 0 ? 'bearish' : 'neutral';

        return { 
            cryptoData, 
            stockData, 
            displayedAssets, 
            bullishCount, 
            bearishCount, 
            neutralCount, 
            totalChange, 
            marketSentiment 
        };
    }, [marketData]);

    const marketStats = useMemo(() => [
        { 
            label: 'Total Assets', 
            value: displayedAssets.length, 
            color: 'cyan',
            description: 'Active Monitoring',
            icon: '📊'
        },
        { 
            label: 'Bullish', 
            value: bullishCount, 
            color: 'green',
            description: 'Positive Momentum',
            icon: '🚀'
        },
        { 
            label: 'Bearish', 
            value: bearishCount, 
            color: 'red',
            description: 'Downward Pressure',
            icon: '📉'
        },
        { 
            label: 'Neutral', 
            value: neutralCount, 
            color: 'blue',
            description: 'Market Stability',
            icon: '⚖️'
        }
    ], [displayedAssets.length, bullishCount, bearishCount, neutralCount]);

    return (
        <section className="mb-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Floating Crypto Particles */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {['₿', 'Ξ', '★', '●', '◆'].map((symbol, i) => (
                    <div
                        key={i}
                        className="absolute text-cyan-400/20 animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${20 + Math.random() * 15}s`,
                            fontSize: `${12 + Math.random() * 8}px`
                        }}
                    >
                        {symbol}
                    </div>
                ))}
            </div>

            {/* Enhanced Header with Magic */}
            <div className="relative group mb-8 md:mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-1000 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-r from-blue-900/60 to-cyan-800/40 backdrop-blur-xl border-l-4 border-cyan-400 p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
                        <div className="w-full">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping absolute"></div>
                                    <div className="w-3 h-3 bg-cyan-400 rounded-full relative"></div>
                                </div>
                                <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase bg-cyan-400/10 px-3 py-1 rounded-full">
                                    Quantum Enhanced
                                </span>
                            </div>
                            <h2 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 md:mb-3 leading-tight">
                                Live Market Intelligence
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base lg:text-xl font-light max-w-2xl">
                                Advanced real-time financial markets monitoring with AI-powered analytics
                            </p>
                        </div>
                        <div className="text-left lg:text-right space-y-3 w-full lg:w-auto">
                            <div className="inline-flex items-center min-h-[44px] px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/40 backdrop-blur-sm shadow-lg w-full lg:w-auto justify-center lg:justify-end">
                                <div className="relative mr-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-ping"></div>
                                </div>
                                <span className="text-transparent bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text font-bold text-sm tracking-widest">
                                    QUANTUM LIVE
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="text-cyan-300 text-xs md:text-sm font-semibold lg:text-right text-center">
                                    Next update: <span className="text-cyan-300 font-black text-base md:text-lg">{timeUntilUpdate}s</span>
                                </div>
                                <div className="w-full lg:w-32 bg-gray-700/50 rounded-full h-1.5 mx-auto lg:ml-auto lg:mr-0">
                                    <div 
                                        className="bg-gradient-to-r from-cyan-400 to-blue-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(timeUntilUpdate / COUNTDOWN_DURATION) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Sentiment Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-gray-800/60 to-slate-800/40 backdrop-blur-lg rounded-xl p-3 md:p-4 lg:p-6 border border-cyan-500/20 shadow-lg h-full flex items-center">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2 md:space-x-3">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${
                                    marketSentiment === 'bullish' ? 'bg-green-400' : 
                                    marketSentiment === 'bearish' ? 'bg-red-400' : 'bg-blue-400'
                                }`}></div>
                                <span className="text-gray-300 font-semibold text-sm md:text-base">Market Pulse</span>
                            </div>
                            <div className="text-cyan-400 text-xs md:text-sm font-medium">
                                {marketSentiment.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-xl p-3 md:p-4 lg:p-6 border border-cyan-500/20 text-center">
                            <div className="text-xl md:text-2xl font-black text-cyan-400">{displayedAssets.length}</div>
                            <div className="text-cyan-400/70 text-[10px] md:text-xs font-medium">ACTIVE ASSETS</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-xl p-3 md:p-4 lg:p-6 border border-green-500/20 text-center">
                            <div className="text-xl md:text-2xl font-black text-green-400">{bullishCount}</div>
                            <div className="text-green-400/70 text-[10px] md:text-xs font-medium">BULLISH</div>
                        </div>
                        <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-lg rounded-xl p-3 md:p-4 lg:p-6 border border-red-500/20 text-center">
                            <div className="text-xl md:text-2xl font-black text-red-400">{bearishCount}</div>
                            <div className="text-red-400/70 text-[10px] md:text-xs font-medium">BEARISH</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Market Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
                {marketStats.map((stat, index) => (
                    <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl blur-md group-hover:blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                        <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-5 lg:p-6 border border-cyan-500/20 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:border-cyan-400/40">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-xs md:text-sm font-medium mb-1">{stat.label}</div>
                                    <div className={`text-2xl md:text-3xl font-black ${
                                        stat.color === 'cyan' ? 'text-cyan-400' :
                                        stat.color === 'green' ? 'text-green-400' :
                                        stat.color === 'red' ? 'text-red-400' : 'text-blue-400'
                                    }`}>
                                        {stat.value}
                                    </div>
                                    <div className={`text-[10px] md:text-xs font-medium ${
                                        stat.color === 'cyan' ? 'text-cyan-400/70' :
                                        stat.color === 'green' ? 'text-green-400/70' :
                                        stat.color === 'red' ? 'text-red-400/70' : 'text-blue-400/70'
                                    }`}>
                                        {stat.description}
                                    </div>
                                </div>
                                <div className="text-2xl opacity-60 transform group-hover:scale-110 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-500 ease-out"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading State */}
            <div className={`transition-all duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Cryptocurrency Section */}
                <div className="mb-6 md:mb-8 group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    Cryptocurrency Markets
                                </h3>
                                <p className="text-gray-400 text-xs md:text-sm font-light">Top 10 digital assets performance</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-2 md:px-3 py-1 md:py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 min-h-[44px]">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span className="text-cyan-400 text-xs md:text-sm font-semibold">QUANTUM FEED</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                        {cryptoData.map((data, index) => (
                            <div 
                                key={data.ticker} 
                                className="transform transition-all duration-300 hover:scale-105"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <MarketCard data={data} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stocks Section */}
                <div className="group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="w-1 h-8 md:h-10 bg-gradient-to-b from-green-400 to-blue-400 rounded-full animate-pulse"></div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                    Major Stocks
                                </h3>
                                <p className="text-gray-400 text-xs md:text-sm font-light">Top 10 equity market data</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-2 md:px-3 py-1 md:py-2 bg-green-500/10 rounded-lg border border-green-500/20 min-h-[44px]">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-xs md:text-sm font-semibold">INSTITUTIONAL FEED</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                        {stockData.map((data, index) => (
                            <div 
                                key={data.ticker} 
                                className="transform transition-all duration-300 hover:scale-105"
                                style={{ animationDelay: `${index * 50 + 100}ms` }}
                            >
                                <MarketCard data={data} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Footer Status Bar */}
            <div className="mt-6 md:mt-8 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg blur-md group-hover:blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-lg p-3 md:p-4 lg:p-6 border border-gray-700/50 shadow-lg hover:border-cyan-500/30 transition-all duration-300">
                        <div className="flex flex-col md:flex-row items-center justify-between text-xs md:text-sm gap-3">
                            <div className="flex items-center flex-wrap justify-center md:justify-start gap-2 md:gap-4 lg:gap-6 w-full md:w-auto">
                                <div className="text-gray-400 font-medium text-center md:text-left">
                                    <span className="text-cyan-400 font-bold block sm:inline">Quantum Analytics</span> <span className="hidden sm:inline">•</span> 
                                    <span className="text-green-400 mx-0 sm:mx-2 block sm:inline">Live Data</span> <span className="hidden sm:inline">•</span> 
                                    Next update: <span className="text-cyan-300 font-semibold ml-1">{timeUntilUpdate}s</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto justify-center md:justify-end">
                                <div className="text-gray-500 font-medium text-center">
                                    {new Date().toLocaleString()} UTC
                                </div>
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketDashboard;