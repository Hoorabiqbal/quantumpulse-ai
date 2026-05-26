import React, { useState, useEffect, useRef } from 'react';
import { Sentiment } from '../types';
import { BullishIcon, BearishIcon, NeutralIcon } from './icons';

interface ReasoningCardProps {
  reasoning: string;
  sentiment: Sentiment;
}

const sentimentConfig = {
    [Sentiment.Bullish]: {
        Icon: BullishIcon,
        text: 'text-green-400',
        gradient: 'from-green-500 to-emerald-400',
        bgGradient: 'from-green-500/10 to-emerald-400/5',
        borderGradient: 'from-green-400 to-emerald-300',
        shadow: 'shadow-lg shadow-green-500/20',
        pulse: 'hover:shadow-green-500/30',
        badge: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    [Sentiment.Bearish]: {
        Icon: BearishIcon,
        text: 'text-red-400',
        gradient: 'from-red-500 to-rose-400',
        bgGradient: 'from-red-500/10 to-rose-400/5',
        borderGradient: 'from-red-400 to-rose-300',
        shadow: 'shadow-lg shadow-red-500/20',
        pulse: 'hover:shadow-red-500/30',
        badge: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    [Sentiment.Neutral]: {
        Icon: NeutralIcon,
        text: 'text-cyan-400',
        gradient: 'from-cyan-500 to-blue-400',
        bgGradient: 'from-cyan-500/10 to-blue-400/5',
        borderGradient: 'from-cyan-400 to-blue-300',
        shadow: 'shadow-lg shadow-cyan-500/20',
        pulse: 'hover:shadow-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    }
};

const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning, sentiment }) => {
    const [displayedReasoning, setDisplayedReasoning] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const { Icon, text: textColor, gradient, bgGradient, borderGradient, shadow, pulse, badge } = sentimentConfig[sentiment];

    useEffect(() => {
        setDisplayedReasoning('');
        setIsTypingComplete(false);
        
        if (!reasoning) {
            setIsTypingComplete(true);
            return;
        }

        // Cancel any existing animation
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        // Reset start time
        startTimeRef.current = null;

        let index = 0;
        const textLength = reasoning.length;
        
        // Better timing calculation - slower and more natural
        const baseDuration = 3000; // Base 3 seconds for medium text
        const charDuration = 40; // Slower character-by-character timing
        const duration = Math.min(baseDuration + (textLength * charDuration), 6000); // Max 6 seconds

        const animateTyping = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            
            index = Math.floor(progress * textLength);
            setDisplayedReasoning(reasoning.substring(0, index));

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateTyping);
            } else {
                setDisplayedReasoning(reasoning);
                setIsTypingComplete(true);
                startTimeRef.current = null;
                animationRef.current = null;
            }
        };

        // Small delay before starting animation for better UX
        const timeoutId = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animateTyping);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            startTimeRef.current = null;
        };
    }, [reasoning]);

    // Skip animation for very short texts
    const shouldAnimate = reasoning.length > 20;

    return (
        <div 
            className={`relative rounded-2xl p-3 md:p-4 lg:p-6 transition-all duration-500 ease-out transform hover:-translate-y-2 ${shadow} ${pulse} bg-gradient-to-br ${bgGradient} border border-slate-700/50 hover:border-slate-600/70 overflow-hidden group backdrop-blur-sm`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-100 transition-all duration-700 ${isHovered ? 'opacity-80' : 'opacity-60'}`}></div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute w-2 h-2 bg-gradient-to-r ${borderGradient} rounded-full opacity-20 ${isHovered ? 'opacity-40 animate-bounce' : ''}`} 
                     style={{ top: '20%', left: '10%' }}></div>
                <div className={`absolute w-1 h-1 bg-gradient-to-r ${borderGradient} rounded-full opacity-15 ${isHovered ? 'opacity-30 animate-bounce' : ''}`} 
                     style={{ top: '60%', left: '85%', animationDelay: '1s' }}></div>
                <div className={`absolute w-1.5 h-1.5 bg-gradient-to-r ${borderGradient} rounded-full opacity-25 ${isHovered ? 'opacity-35 animate-bounce' : ''}`} 
                     style={{ top: '80%', left: '15%', animationDelay: '0.5s' }}></div>
            </div>

            {/* Animated Border Glow */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${borderGradient} opacity-0 group-hover:opacity-20 blur-lg transition-all duration-700 -z-10`}></div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                    {/* Enhanced Icon with Animations */}
                    <div className="relative flex-shrink-0">
                        {/* Icon Background Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 ${isHovered ? 'scale-125' : ''}`}></div>
                        
                        {/* Animated Icon Container */}
                        <div className={`relative p-2 md:p-2.5 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 ${textColor} drop-shadow-lg transition-all duration-300 ${isHovered ? 'scale-110' : ''}`} />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 w-full">
                        {/* Professional Header with ExpertView */}
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className="flex items-center gap-2 md:gap-3">
                                <h3 className="font-sans font-bold text-base md:text-lg lg:text-xl bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent transition-all duration-500 tracking-wide">
                                    ExpertView
                                </h3>
                                {/* Sentiment Badge */}
                                <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs lg:text-sm font-semibold border ${badge} backdrop-blur-sm`}>
                                    {sentiment === Sentiment.Bullish ? 'Bullish' : 
                                     sentiment === Sentiment.Bearish ? 'Bearish' : 'Neutral'}
                                </span>
                            </div>
                            
                            {/* Animated Dot */}
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} animate-pulse ${isTypingComplete ? 'opacity-100' : 'opacity-50'}`}></div>
                        </div>

                        {/* Professional Text Content with Better Typography */}
                        <div className="relative">
                            <p className="font-sans text-slate-200 leading-relaxed text-sm md:text-base lg:text-lg font-light min-h-[60px] md:min-h-[80px] tracking-normal transition-all duration-500">
                                {/* Show full text immediately for short content or if animation is disabled */}
                                {!shouldAnimate || isTypingComplete ? reasoning : displayedReasoning}
                                
                                {/* Enhanced Typing Cursor */}
                                {shouldAnimate && !isTypingComplete && (
                                    <span className={`inline-block w-0.5 h-4 bg-gradient-to-b ${gradient} animate-pulse ml-0.5 rounded-full align-middle drop-shadow-lg`}></span>
                                )}
                            </p>
                            
                            {/* Text Shimmer Effect */}
                            {isTypingComplete && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 blur-sm"></div>
                            )}
                        </div>

                        {/* Progress Indicator - Only show for animated content */}
                        {shouldAnimate && !isTypingComplete && reasoning.length > 0 && (
                            <div className="mt-4 w-full bg-slate-700/50 rounded-full h-1 overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-300 ease-out`}
                                    style={{ 
                                        width: `${((displayedReasoning.length / reasoning.length) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                        )}

                        {/* Completion Badge - Only show for animated content */}
                        {shouldAnimate && isTypingComplete && (
                            <div className="mt-3 md:mt-4 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} animate-pulse`}></div>
                                <span className="font-sans text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Analysis Ready
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Corner Accents */}
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${textColor} border-opacity-30 rounded-tr-2xl transition-all duration-500 ${isHovered ? 'border-opacity-60 w-8 h-8' : ''}`}></div>
            <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${textColor} border-opacity-30 rounded-bl-2xl transition-all duration-500 ${isHovered ? 'border-opacity-60 w-8 h-8' : ''}`}></div>

            {/* Professional Bottom Border */}
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-40 transition-all duration-500 ${isHovered ? 'opacity-40' : ''}`}></div>
        </div>
    );
};

export default ReasoningCard;