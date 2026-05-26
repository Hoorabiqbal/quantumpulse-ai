import React, { useState, useEffect, memo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { MarketData } from '../types';
import { calculateVolatilityPercentage } from '../utils/mathUtils';

interface MarketCardProps {
    data: MarketData;
}

const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toLocaleString()}`;
};

// Custom comparison function - only re-render when price/change actually changes
const areEqual = (prevProps: MarketCardProps, nextProps: MarketCardProps) => {
    return (
        prevProps.data.ticker === nextProps.data.ticker &&
        prevProps.data.price === nextProps.data.price &&
        prevProps.data.change === nextProps.data.change &&
        prevProps.data.volume === nextProps.data.volume &&
        // Only re-render if price change is significant (> 0.01)
        Math.abs(prevProps.data.change - nextProps.data.change) < 0.01 &&
        // Check if sparkline data is effectively the same
        JSON.stringify(prevProps.data.sparkline) === JSON.stringify(nextProps.data.sparkline)
    );
};

const MarketCard: React.FC<MarketCardProps> = memo(({ data }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [displayedPrice, setDisplayedPrice] = useState(data.price || 0);
    const [displayedChange, setDisplayedChange] = useState(data.change || 0);
    const [priceAnimation, setPriceAnimation] = useState<'up' | 'down' | 'none'>('none');
    const [isMobile, setIsMobile] = useState(false);

    // RESPONSIVE: Window resize listener with cleanup
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // FIXED: Null safety for all calculations
    const isPositive = (displayedChange || 0) >= 0;

    // FIXED: Null safety for price formatting
    const formattedPrice = (displayedPrice && displayedPrice > 0)
        ? displayedPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        : '0.00';

    // FIXED: Null safety for sparkline data
    const sparklineData = (data.sparkline && data.sparkline.length > 0)
        ? data.sparkline.map((price, index) => ({ name: index, value: price || 0 }))
        : Array(10).fill(0).map((_, index) => ({ name: index, value: 0 }));

    const domain = sparklineData.length > 0
        ? [Math.min(...sparklineData.map(d => d.value)), Math.max(...sparklineData.map(d => d.value))]
        : [0, 1];

    // Calculate Volatility
    const rawPrices = data.sparkline || [];
    const volatilityPercent = calculateVolatilityPercentage(rawPrices);
    const isHighlyVolatile = volatilityPercent > 2.0; // Threshold for high volatility (2%)

    // Animate price and change values
    useEffect(() => {
        const currentPrice = data.price || 0;
        const currentChange = data.change || 0;
        const priceDiff = currentPrice - displayedPrice;
        const changeDiff = currentChange - displayedChange;

        if (priceDiff !== 0) {
            setPriceAnimation(priceDiff > 0 ? 'up' : 'down');

            let startPrice = displayedPrice;
            let startChange = displayedChange;
            const duration = 600; // Faster animation for professional feel
            const steps = 20; // Fewer steps for smoother performance
            const incrementPrice = priceDiff / steps;
            const incrementChange = changeDiff / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                startPrice += incrementPrice;
                startChange += incrementChange;

                if (currentStep >= steps) {
                    setDisplayedPrice(currentPrice);
                    setDisplayedChange(currentChange);
                    setTimeout(() => setPriceAnimation('none'), 200);
                    clearInterval(timer);
                } else {
                    setDisplayedPrice(Number(startPrice.toFixed(2)));
                    setDisplayedChange(Number(startChange.toFixed(2)));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [data.price, data.change]);

    return (
        <div 
            className="relative h-full transform transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03] group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Subtle Border Glow (Premium UI) */}
            <div className={`absolute -inset-[1px] bg-gradient-to-br ${isPositive ? 'from-emerald-500/30 via-emerald-500/5 to-emerald-400/30' : 'from-rose-500/30 via-rose-500/5 to-rose-400/30'} rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500`}></div>

            {/* Main Card */}
            <div className="relative rounded-2xl p-4 lg:p-5 flex flex-col h-full bg-slate-900/90 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
                
                {/* Dynamic Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isPositive ? 'from-emerald-500/10 via-transparent to-transparent' : 'from-rose-500/10 via-transparent to-transparent'} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    {/* Header Section */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg md:text-xl text-white tracking-tight">
                                    {data.ticker}
                                </h3>
                                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {isPositive ? 'BULL' : 'BEAR'}
                                </div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                                {data.name}
                            </span>
                        </div>

                        {/* Sparkline Chart */}
                        <div className="w-[80px] md:w-[100px] h-[35px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sparklineData}>
                                    <YAxis domain={domain} hide={true} />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={isPositive ? "#10b981" : "#f43f5e"}
                                        strokeWidth={2.5}
                                        dot={false}
                                        strokeLinecap="round"
                                        isAnimationActive={!isMobile}
                                        style={{ filter: `drop-shadow(0px 2px 4px ${isPositive ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'})` }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Price & Change Section */}
                    <div className="flex items-end justify-between mt-1">
                        <div className="flex flex-col">
                            <span className={`font-mono text-2xl lg:text-[28px] leading-tight font-bold tracking-tight ${priceAnimation === 'up' ? 'text-emerald-300' : priceAnimation === 'down' ? 'text-rose-300' : 'text-white'} transition-colors duration-300`}>
                                ${formattedPrice}
                            </span>
                            <div className={`flex items-center gap-1 mt-0.5 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <span className="text-lg leading-none">{isPositive ? '↑' : '↓'}</span>
                                <span>{Math.abs(displayedChange).toFixed(2)}%</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50 shadow-inner">
                            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isPositive ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]'}`}></div>
                            <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">LIVE</span>
                        </div>
                    </div>

                    {/* Footer Stats Section (Always Visible) */}
                    <div className="grid grid-cols-2 gap-4 pt-3 mt-1 border-t border-slate-700/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Volatility</span>
                            <div className={`flex items-center gap-1.5 text-xs font-bold ${isHighlyVolatile ? 'text-amber-400' : 'text-blue-400'}`}>
                                <span>{volatilityPercent.toFixed(2)}%</span>
                                {isHighlyVolatile && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Vol 24H</span>
                            <span className="text-xs font-bold text-slate-300 tracking-tight">
                                {data.volume ? formatVolume(data.volume) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, areEqual);

export default MarketCard;