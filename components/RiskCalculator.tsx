import React, { useState, useCallback, useMemo, useRef } from 'react';
import { TradePosition, PNLResult, RiskAssessment, CalculatorMode, TradeValidation } from '../types';
import RiskMeter from './RiskMeter';

// Extend TradePosition locally to include volatility for the calculator
interface ExtendedTradePosition extends TradePosition {
  marketVolatility?: number;
}

// Memoized calculation functions outside component
const calculateSpotPNL = (position: TradePosition): PNLResult => {
  const { entryPrice, stopLossPrice, takeProfitPrice, investmentAmount } = position;
  
  const positionSize = investmentAmount;
  const pnlAtTP = ((takeProfitPrice - entryPrice) / entryPrice) * investmentAmount;
  const pnlAtSL = ((stopLossPrice - entryPrice) / entryPrice) * investmentAmount;
  const roiAtTP = (pnlAtTP / investmentAmount) * 100;
  const roiAtSL = (pnlAtSL / investmentAmount) * 100;
  const riskReward = Math.abs((takeProfitPrice - entryPrice) / (entryPrice - stopLossPrice));

  const maxLossPercent = Math.abs(roiAtSL);
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (maxLossPercent <= 5) riskLevel = 'low';
  else if (maxLossPercent <= 15) riskLevel = 'medium';
  else if (maxLossPercent <= 25) riskLevel = 'high';
  else riskLevel = 'extreme';

  return {
    pnlAtTakeProfit: pnlAtTP,
    pnlAtStopLoss: pnlAtSL,
    roiAtTakeProfit: roiAtTP,
    roiAtStopLoss: roiAtSL,
    riskRewardRatio: riskReward,
    positionSize,
    tradeSize: investmentAmount,
    liquidationPrice: 0,
    marginUsed: investmentAmount,
    safetyMargin: 100,
    riskLevel,
    isProfitableAtTP: pnlAtTP > 0,
    isProfitableAtSL: pnlAtSL > 0
  };
};

const calculateFuturesPNL = (position: TradePosition): PNLResult => {
  const { direction, entryPrice, stopLossPrice, takeProfitPrice, investmentAmount, leverage } = position;
  
  const tradeSize = investmentAmount * leverage;
  const positionSize = tradeSize;
  
  let pnlAtTP: number, pnlAtSL: number;
  if (direction === 'long') {
    pnlAtTP = ((takeProfitPrice - entryPrice) / entryPrice) * tradeSize;
    pnlAtSL = ((stopLossPrice - entryPrice) / entryPrice) * tradeSize;
  } else {
    pnlAtTP = ((entryPrice - takeProfitPrice) / entryPrice) * tradeSize;
    pnlAtSL = ((entryPrice - stopLossPrice) / entryPrice) * tradeSize;
  }

  const roiAtTP = (pnlAtTP / investmentAmount) * 100;
  const roiAtSL = (pnlAtSL / investmentAmount) * 100;
  const riskReward = Math.abs(pnlAtTP / pnlAtSL);

  const liquidationPrice = direction === 'long' 
    ? entryPrice * (1 - (1 / leverage))
    : entryPrice * (1 + (1 / leverage));

  const safetyMargin = direction === 'long'
    ? ((entryPrice - liquidationPrice) / entryPrice) * 100
    : ((liquidationPrice - entryPrice) / entryPrice) * 100;

  const maxLossPercent = Math.abs(roiAtSL);
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (maxLossPercent <= 10 && leverage <= 5) riskLevel = 'low';
  else if (maxLossPercent <= 25 && leverage <= 10) riskLevel = 'medium';
  else if (maxLossPercent <= 50 && leverage <= 20) riskLevel = 'high';
  else riskLevel = 'extreme';

  return {
    pnlAtTakeProfit: pnlAtTP,
    pnlAtStopLoss: pnlAtSL,
    roiAtTakeProfit: roiAtTP,
    roiAtStopLoss: roiAtSL,
    riskRewardRatio: riskReward,
    positionSize,
    tradeSize,
    liquidationPrice,
    marginUsed: investmentAmount,
    safetyMargin,
    riskLevel,
    isProfitableAtTP: pnlAtTP > 0,
    isProfitableAtSL: pnlAtSL > 0
  };
};

const validateTrade = (position: TradePosition): TradeValidation => {
  const { mode, direction, entryPrice, stopLossPrice, takeProfitPrice } = position;

  if (mode === 'spot') {
    if (stopLossPrice >= entryPrice || takeProfitPrice <= entryPrice) {
      return { isValid: false, message: 'Invalid prices', type: 'error' };
    }
  } else {
    if (direction === 'long') {
      if (stopLossPrice >= entryPrice || takeProfitPrice <= entryPrice) {
        return { isValid: false, message: 'Invalid prices', type: 'error' };
      }
    } else {
      if (takeProfitPrice >= entryPrice || stopLossPrice <= entryPrice) {
        return { isValid: false, message: 'Invalid prices', type: 'error' };
      }
    }
  }

  return { isValid: true, message: 'Valid trade setup', type: 'success' };
};

const RiskCalculator: React.FC = () => {
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [position, setPosition] = useState<ExtendedTradePosition>({
    mode: 'spot',
    direction: 'long',
    entryPrice: 100,
    stopLossPrice: 90,
    takeProfitPrice: 130,
    investmentAmount: 100,
    leverage: 10,
    marketVolatility: 1.5 // Default volatility
  });

  const [mode, setMode] = useState<CalculatorMode>({
    current: 'spot',
    isAnimating: false
  });

  const validation = useMemo(() => validateTrade(position), [position]);

  const pnlResult = useMemo((): PNLResult => {
    const { mode, entryPrice, stopLossPrice, takeProfitPrice, investmentAmount } = position;

    if (!entryPrice || !stopLossPrice || !takeProfitPrice || !investmentAmount || investmentAmount <= 0) {
      return {
        pnlAtTakeProfit: 0,
        pnlAtStopLoss: 0,
        roiAtTakeProfit: 0,
        roiAtStopLoss: 0,
        riskRewardRatio: 0,
        positionSize: 0,
        tradeSize: 0,
        liquidationPrice: 0,
        marginUsed: 0,
        safetyMargin: 0,
        riskLevel: 'low',
        isProfitableAtTP: false,
        isProfitableAtSL: false
      };
    }

    return position.mode === 'spot' 
      ? calculateSpotPNL(position)
      : calculateFuturesPNL(position);
  }, [position]);

  const riskAssessment = useMemo((): RiskAssessment => {
    const { riskLevel, isProfitableAtTP, safetyMargin } = pnlResult;
    const { leverage, mode } = position;

    let liquidationRisk: 'safe' | 'caution' | 'danger' | 'extreme' = 'safe';
    if (mode === 'futures') {
      if (safetyMargin > 10) liquidationRisk = 'safe';
      else if (safetyMargin > 5) liquidationRisk = 'caution';
      else if (safetyMargin > 2) liquidationRisk = 'danger';
      else liquidationRisk = 'extreme';
    }

    const leverageWarning = false;

    const assessments = {
      low: { color: 'from-green-500 to-emerald-500', message: 'Low Risk' },
      medium: { color: 'from-yellow-500 to-amber-500', message: 'Medium Risk' },
      high: { color: 'from-orange-500 to-red-500', message: 'High Risk' },
      extreme: { color: 'from-red-600 to-pink-600', message: 'Extreme Risk' }
    };

    return {
      level: riskLevel,
      color: assessments[riskLevel].color,
      message: assessments[riskLevel].message,
      isProfitable: isProfitableAtTP,
      liquidationRisk,
      leverageWarning
    };
  }, [pnlResult, position]);

  const handleInputChange = useCallback((field: keyof ExtendedTradePosition, value: number) => {
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    inputTimeoutRef.current = setTimeout(() => {
      setPosition(prev => ({ ...prev, [field]: value }));
    }, 150);
  }, []);

  const handleModeSwitch = useCallback((newMode: 'spot' | 'futures') => {
    if (mode.current === newMode || mode.isAnimating) return;
    
    // Start animation
    setMode({ current: mode.current, isAnimating: true });
    
    // After animation halfway, switch mode
    setTimeout(() => {
      setPosition(prev => ({ 
        ...prev, 
        mode: newMode,
        leverage: newMode === 'spot' ? 1 : prev.leverage
      }));
      // Complete animation
      setTimeout(() => {
        setMode({ current: newMode, isAnimating: false });
      }, 150);
    }, 300);
  }, [mode.current, mode.isAnimating]);

  const handleDirectionSwitch = useCallback((newDirection: 'long' | 'short') => {
    setPosition(prev => ({ ...prev, direction: newDirection }));
  }, []);

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }, []);

  React.useEffect(() => {
    return () => {
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="group relative">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-700/20 to-slate-800/30 rounded-2xl blur-lg opacity-50"></div>
      
      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/10 p-3 md:p-4 lg:p-6">
        
        {/* Professional Header */}
        <div className="text-center mb-4 md:mb-6">
          <div className="relative inline-flex items-center justify-center mb-3 md:mb-4">
            <h1 className="text-white text-base md:text-xl lg:text-2xl font-bold tracking-tight drop-shadow-lg">
              Risk Calculator
            </h1>
          </div>
          
          {/* Elegant Toggle */}
          <div className="flex justify-center">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-white/10 shadow-lg flex w-full md:w-auto">
              <button
                onClick={() => handleModeSwitch('spot')}
                className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs lg:text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  mode.current === 'spot'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                <span className="relative">Spot</span>
              </button>
              <button
                onClick={() => handleModeSwitch('futures')}
                className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs lg:text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  mode.current === 'futures'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-blue-300 hover:bg-white/5'
                }`}
              >
                <span className="relative">Futures</span>
              </button>
            </div>
          </div>
        </div>

        {/* Animation Container */}
        <div className={`relative transition-all duration-500 ${mode.isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          
          {/* Direction Toggle for Futures - Clean */}
          {mode.current === 'futures' && (
            <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-white/10 shadow-lg mb-3 md:mb-4">
              <button
                onClick={() => handleDirectionSwitch('long')}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                  position.direction === 'long'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'text-gray-400 hover:text-green-300 hover:bg-white/5'
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => handleDirectionSwitch('short')}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                  position.direction === 'short'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-gray-400 hover:text-red-300 hover:bg-white/5'
                }`}
              >
                SHORT
              </button>
            </div>
          )}

          {/* Clean Input Grid */}
          <div className="space-y-3 md:space-y-4 mb-3 md:mb-4">
            {/* Price Inputs */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-cyan-300 text-[10px] md:text-xs lg:text-sm font-medium block">Entry Price</label>
                  <input
                    type="number"
                    value={position.entryPrice || ''}
                    onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                    className="w-full min-h-[44px] md:min-h-0 md:h-9 lg:h-10 bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-3 text-white text-sm md:text-base font-mono focus:border-cyan-400 focus:outline-none transition-all duration-300 hover:border-cyan-400/50 placeholder-gray-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-green-400 text-[10px] md:text-xs lg:text-sm font-medium block">Take Profit</label>
                  <input
                    type="number"
                    value={position.takeProfitPrice || ''}
                    onChange={(e) => handleInputChange('takeProfitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full min-h-[44px] md:min-h-0 md:h-9 lg:h-10 bg-slate-800/60 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 text-white text-sm md:text-base font-mono focus:border-green-400 focus:outline-none transition-all duration-300 hover:border-green-400/50 placeholder-gray-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-red-400 text-[10px] md:text-xs lg:text-sm font-medium block">Stop Loss</label>
                  <input
                    type="number"
                    value={position.stopLossPrice || ''}
                    onChange={(e) => handleInputChange('stopLossPrice', parseFloat(e.target.value) || 0)}
                    className="w-full min-h-[44px] md:min-h-0 md:h-9 lg:h-10 bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 text-white text-sm md:text-base font-mono focus:border-red-400 focus:outline-none transition-all duration-300 hover:border-red-400/50 placeholder-gray-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Investment & Leverage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1">
                <label className="text-cyan-300 text-[10px] md:text-xs lg:text-sm font-medium block">
                  {mode.current === 'spot' ? 'Investment' : 'Amount (USDT)'}
                </label>
                <input
                  type="number"
                  value={position.investmentAmount || ''}
                  onChange={(e) => handleInputChange('investmentAmount', parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] md:min-h-0 md:h-9 lg:h-10 bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-3 text-white text-sm md:text-base font-mono focus:border-cyan-400 focus:outline-none transition-all duration-300 hover:border-cyan-400/50 placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>

              {mode.current === 'futures' && (
                <div className="space-y-1">
                  <label className="text-blue-300 text-[10px] md:text-xs lg:text-sm font-medium block">Leverage</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={position.leverage || 1}
                    onChange={(e) => handleInputChange('leverage', parseInt(e.target.value) || 1)}
                    className="w-full min-h-[44px] md:min-h-0 md:h-9 lg:h-10 bg-slate-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 text-white text-sm md:text-base font-mono focus:border-blue-400 focus:outline-none transition-all duration-300 hover:border-blue-400/50 placeholder-gray-500"
                    placeholder="1x"
                  />
                </div>
              )}
            </div>

            {/* Volatility Input (Data Science Feature) */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-orange-300 text-[10px] md:text-xs lg:text-sm font-medium">Expected Market Volatility (%)</label>
                <span className="text-orange-400 font-mono font-bold text-xs">{position.marketVolatility?.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={position.marketVolatility || 1.5}
                onChange={(e) => handleInputChange('marketVolatility', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              {position.marketVolatility! > 2.5 && (
                <div className="mt-2 text-[10px] md:text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/20 flex items-start gap-2">
                  <span>⚠️</span>
                  <span><strong>High Volatility Detected.</strong> Wide price swings expected. Consider widening your Stop Loss to avoid premature liquidation, or reducing your position size.</span>
                </div>
              )}
            </div>

            {/* Position Size - Only in Spot */}
            {mode.current === 'spot' && pnlResult.positionSize > 0 && (
              <div className="bg-slate-800/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3">
                <div className="text-cyan-300 text-xs font-medium mb-1">Position Size</div>
                <div className="text-cyan-200 font-mono text-sm font-bold">{formatCurrency(pnlResult.positionSize)}</div>
              </div>
            )}

            {/* Liquidation Price - Only in Futures */}
            {mode.current === 'futures' && pnlResult.liquidationPrice > 0 && (
              <div className={`p-3 rounded-lg border backdrop-blur-sm ${
                riskAssessment.liquidationRisk === 'safe' ? 'bg-green-500/10 border-green-500/30' :
                riskAssessment.liquidationRisk === 'caution' ? 'bg-yellow-500/10 border-yellow-500/30' :
                riskAssessment.liquidationRisk === 'danger' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-white text-xs font-medium">Liquidation Price</div>
                  <div className={`text-xs font-bold ${
                    riskAssessment.liquidationRisk === 'safe' ? 'text-green-400' :
                    riskAssessment.liquidationRisk === 'caution' ? 'text-yellow-400' :
                    riskAssessment.liquidationRisk === 'danger' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {riskAssessment.liquidationRisk.toUpperCase()}
                  </div>
                </div>
                <div className="text-white font-mono text-sm font-bold">{formatCurrency(pnlResult.liquidationPrice)}</div>
              </div>
            )}
          </div>

          {/* Clean Results */}
          <div className="space-y-3 md:space-y-4">
            {/* PNL Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <div className="text-green-400 text-xs md:text-sm lg:text-base font-medium mb-1">Take Profit</div>
                <div className={`text-sm md:text-base lg:text-lg font-bold font-mono ${
                  pnlResult.isProfitableAtTP ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(pnlResult.pnlAtTakeProfit)}
                </div>
                <div className={`text-[10px] md:text-xs lg:text-sm font-mono ${
                  pnlResult.isProfitableAtTP ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatPercentage(pnlResult.roiAtTakeProfit)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/5 border border-red-500/30 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <div className="text-red-400 text-xs md:text-sm lg:text-base font-medium mb-1">Stop Loss</div>
                <div className={`text-sm md:text-base lg:text-lg font-bold font-mono ${
                  pnlResult.isProfitableAtSL ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(pnlResult.pnlAtStopLoss)}
                </div>
                <div className={`text-[10px] md:text-xs lg:text-sm font-mono ${
                  pnlResult.isProfitableAtSL ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatPercentage(pnlResult.roiAtStopLoss)}
                </div>
              </div>
            </div>

            {/* Risk:Reward Ratio - Clean */}
            <div className="bg-slate-800/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-purple-400 text-xs font-medium">Risk:Reward Ratio</div>
                <div className={`text-xs font-bold ${
                  pnlResult.riskRewardRatio >= 2 ? 'text-green-400' :
                  pnlResult.riskRewardRatio >= 1 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  1:{pnlResult.riskRewardRatio.toFixed(2)}
                </div>
              </div>
              {/* Clean RiskMeter with corrected props */}
              <RiskMeter riskAssessment={riskAssessment} size="sm" animated={true} showLabel={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RiskCalculator);