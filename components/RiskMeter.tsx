import React from 'react';
import { RiskAssessment } from '../types';

interface RiskMeterProps {
  riskAssessment: RiskAssessment;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  showLiquidationRisk?: boolean;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ 
  riskAssessment, 
  size = 'md',
  showLabel = true,
  animated = true,
  showLiquidationRisk = false
}) => {
  const { level, color, message, isProfitable, liquidationRisk, leverageWarning } = riskAssessment;

  // Size configurations
  const sizeConfig = {
    sm: { 
      width: 'w-full md:w-24', 
      height: 'h-1.5 md:h-2 lg:h-3', 
      text: 'text-[10px] md:text-xs lg:text-sm',
      iconSize: 'text-[10px] md:text-xs lg:text-sm',
      padding: 'p-0.5 md:p-1 lg:p-2'
    },
    md: { 
      width: 'w-full', 
      height: 'h-2 md:h-3 lg:h-4', 
      text: 'text-xs md:text-sm lg:text-base',
      iconSize: 'text-xs md:text-sm lg:text-base',
      padding: 'p-1 md:p-2 lg:p-3'
    },
    lg: { 
      width: 'w-full', 
      height: 'h-3 md:h-4 lg:h-5', 
      text: 'text-sm md:text-base lg:text-lg',
      iconSize: 'text-sm md:text-base lg:text-lg',
      padding: 'p-2 md:p-3 lg:p-4'
    }
  };

  // Advanced risk level configurations
  const riskConfig = {
    low: {
      width: 'w-1/4',
      gradient: 'from-green-400 via-emerald-400 to-green-500',
      glow: 'shadow-lg shadow-green-500/40',
      bgGradient: 'from-green-500/20 to-emerald-500/10',
      icon: '🛡️',
      emoji: '🟢',
      description: 'Conservative trade with minimal risk',
      pulse: false,
      intensity: 'low'
    },
    medium: {
      width: 'w-1/2', 
      gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
      glow: 'shadow-lg shadow-yellow-500/40',
      bgGradient: 'from-yellow-500/20 to-amber-500/10',
      icon: '⚖️',
      emoji: '🟡',
      description: 'Balanced risk with moderate potential',
      pulse: false,
      intensity: 'medium'
    },
    high: {
      width: 'w-3/4',
      gradient: 'from-orange-400 via-red-400 to-orange-500',
      glow: 'shadow-lg shadow-orange-500/50',
      bgGradient: 'from-orange-500/20 to-red-500/10',
      icon: '🔥',
      emoji: '🟠',
      description: 'Aggressive trade with significant risk',
      pulse: true,
      intensity: 'high'
    },
    extreme: {
      width: 'w-full',
      gradient: 'from-red-500 via-pink-500 to-red-600',
      glow: 'shadow-xl shadow-red-500/60',
      bgGradient: 'from-red-600/20 to-pink-600/10',
      icon: '💀',
      emoji: '🔴',
      description: 'Extreme risk - potential for significant losses!',
      pulse: true,
      intensity: 'extreme'
    }
  };

  // Liquidation risk configurations
  const liquidationConfig = {
    safe: { color: 'text-green-400', icon: '✅', text: 'Safe' },
    caution: { color: 'text-yellow-400', icon: '⚠️', text: 'Caution' },
    danger: { color: 'text-orange-400', icon: '🚨', text: 'Danger' },
    extreme: { color: 'text-red-400', icon: '💀', text: 'Extreme' }
  };

  const config = riskConfig[level];
  const sizeProps = sizeConfig[size];
  const liquidationInfo = liquidationRisk ? liquidationConfig[liquidationRisk] : null;

  return (
    <div className="group relative">
      {/* Advanced Animated Background Effects */}
      {animated && (
        <>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-700 ${
            config.pulse ? 'pulse-slow-animation' : ''
          }`}></div>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-1000 ${
            level === 'extreme' ? 'glow-animation' : ''
          }`}></div>
        </>
      )}
      
      <div className="relative space-y-3">
        {/* Advanced Header with Multiple Risk Indicators */}
        {showLabel && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
              <div className={`relative ${sizeProps.iconSize} transform transition-all duration-300 group-hover:scale-110 ${
                isProfitable ? 'text-green-400' : 'text-red-400'
              }`}>
                {isProfitable ? '📈' : '📉'}
                {animated && (
                  <div className="absolute inset-0 animate-ping opacity-75">{isProfitable ? '📈' : '📉'}</div>
                )}
              </div>
              <span className={`${sizeProps.text} font-semibold ${
                isProfitable ? 'text-green-400' : 'text-red-400'
              }`}>
                {isProfitable ? 'Profitable' : 'Loss Making'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
              {/* Leverage Warning */}
              {leverageWarning && (
                <div className="flex items-center space-x-1 bg-orange-500/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border border-orange-500/30">
                  <span className="text-orange-400 text-[10px] md:text-xs lg:text-sm">⚡</span>
                  <span className="text-orange-400 text-[10px] md:text-xs lg:text-sm font-bold">HIGH LEVERAGE</span>
                </div>
              )}
              
              <div className={`flex items-center space-x-2 ${sizeProps.text}`}>
                <span className="transform transition-all duration-300 group-hover:scale-125">
                  {config.icon}
                </span>
                <span className={`font-bold capitalize ${
                  level === 'low' ? 'text-green-400' :
                  level === 'medium' ? 'text-yellow-400' :
                  level === 'high' ? 'text-orange-400' :
                  'text-red-400'
                } ${config.pulse ? 'animate-pulse' : ''}`}>
                  {level} Risk
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Multi-layer Risk Meter */}
        <div className={`relative ${sizeProps.width} ${sizeProps.height} bg-gradient-to-r from-slate-700/80 to-slate-600/60 rounded-full overflow-hidden border border-slate-500/30 shadow-inner`}>
          {/* Background Glow Layer */}
          {animated && (
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20 blur-sm ${
              config.pulse ? 'pulse-slow-animation' : ''
            }`}></div>
          )}
          
          {/* Main Progress Bar with Advanced Effects */}
          <div 
            className={`absolute top-0 left-0 ${config.width} ${sizeProps.height} bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ${
              animated ? 'ease-out-cubic' : 'ease-linear'
            } ${config.glow} relative overflow-hidden ${
              config.pulse ? 'pulse-gentle-animation' : ''
            }`}
          >
            {/* Animated Shimmer Effect */}
            {animated && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 shimmer-fast-animation"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-white/60 transform -skew-x-12 shimmer-slow-animation"></div>
              </>
            )}
            
            {/* Particle Effects for High/Extreme Risk */}
            {(level === 'high' || level === 'extreme') && animated && (
              <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full float-animation"
                    style={{
                      left: `${20 + i * 30}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Advanced Risk Level Markers with Labels */}
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {['low', 'medium', 'high', 'extreme'].map((marker, index) => (
              <div key={marker} className="flex flex-col items-center">
                <div
                  className={`w-1 h-3/4 rounded-full transition-all duration-500 ${
                    index <= ['low', 'medium', 'high', 'extreme'].indexOf(level)
                      ? 'bg-white/80 shadow-sm shadow-white/50' 
                      : 'bg-slate-400/30'
                  } ${index === ['low', 'medium', 'high', 'extreme'].indexOf(level) ? 'animate-pulse' : ''}`}
                />
                {size === 'lg' && (
                  <div className={`text-[10px] mt-1 font-medium ${
                    index <= ['low', 'medium', 'high', 'extreme'].indexOf(level)
                      ? 'text-white' 
                      : 'text-slate-400'
                  }`}>
                    {marker.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Risk Information Panel */}
        {showLabel && (
          <div className="space-y-2">
            {/* Main Risk Message */}
            <div className={`text-center ${sizeProps.text} font-semibold ${
              level === 'low' ? 'text-green-400' :
              level === 'medium' ? 'text-yellow-400' :
              level === 'high' ? 'text-orange-400' :
              'text-red-400 animate-pulse'
            }`}>
              {message}
            </div>

            {/* Liquidation Risk Indicator */}
            {showLiquidationRisk && liquidationInfo && (
              <div className="flex items-center justify-center space-x-2 bg-slate-800/40 rounded-lg p-1.5 md:p-2 border border-slate-600/30">
                <span className={liquidationInfo.color}>{liquidationInfo.icon}</span>
                <span className={`text-[10px] md:text-xs lg:text-sm font-medium ${liquidationInfo.color}`}>
                  Liquidation Risk: {liquidationInfo.text}
                </span>
              </div>
            )}

            {/* Detailed Description for Larger Sizes */}
            {size === 'lg' && (
              <div className="text-center">
                <div className="text-slate-400 text-xs md:text-sm lg:text-base leading-relaxed">
                  {config.description}
                </div>
                {leverageWarning && (
                  <div className="text-orange-400 text-[10px] md:text-xs lg:text-sm font-medium mt-1 animate-pulse">
                    ⚡ Consider reducing leverage for better risk management
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Hover Tooltip */}
        {size === 'lg' && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg px-4 py-3 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 min-w-64">
            <div className="text-center space-y-2">
              <div className="text-cyan-300 font-semibold text-sm">Risk Analysis</div>
              <div className="text-white text-xs leading-relaxed">{config.description}</div>
              <div className="flex justify-center space-x-4 text-xs">
                <div className="text-green-400">Low Risk</div>
                <div className="text-yellow-400">Medium</div>
                <div className="text-orange-400">High</div>
                <div className="text-red-400">Extreme</div>
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-cyan-500/30 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMeter;