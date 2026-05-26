import React, { useState, useCallback, memo, useEffect } from 'react';
import { User } from '../types';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  scrollToSection: (sectionRef: React.RefObject<HTMLDivElement>, tabId: string) => void;
  sentimentRef: React.RefObject<HTMLDivElement>;
  marketRef: React.RefObject<HTMLDivElement>;
  newsRef: React.RefObject<HTMLDivElement>;
  historyRef: React.RefObject<HTMLDivElement>;
  fearGreedRef: React.RefObject<HTMLDivElement>;
  riskCalculatorRef: React.RefObject<HTMLDivElement>;
  tradingInsightsRef: React.RefObject<HTMLDivElement>;
  user: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
  onOpenAnalytics: () => void;
}

// Memoized tab configuration
const tabs = [
  { id: 'sentiment', label: 'AI Analyzer', icon: '🧠', color: 'from-cyan-400 to-blue-400' },
  { id: 'market', label: 'Dashboard', icon: '📊', color: 'from-emerald-400 to-teal-400' },
  { id: 'tradinginsights', label: 'Trading Insights', icon: '💡', color: 'from-amber-400 to-orange-400' },
  { id: 'riskcalculator', label: 'Risk Calculator', icon: '⚖️', color: 'from-purple-400 to-pink-400' },
  { id: 'news', label: 'Live News', icon: '📰', color: 'from-green-400 to-emerald-400' },
  { id: 'history', label: 'History', icon: '🕒', color: 'from-blue-400 to-indigo-400' },
  { id: 'feargreed', label: 'Sentiment', icon: '🌡️', color: 'from-rose-400 to-red-400' },
] as const;

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  scrollToSection,
  sentimentRef,
  marketRef,
  newsRef,
  historyRef,
  fearGreedRef,
  riskCalculatorRef,
  tradingInsightsRef,
  user,
  onAuthSuccess,
  onLogout,
  onOpenAnalytics
}) => {
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabRefs = React.useMemo(() => ({
    sentiment: sentimentRef,
    market: marketRef,
    news: newsRef,
    history: historyRef,
    feargreed: fearGreedRef,
    riskcalculator: riskCalculatorRef,
    tradinginsights: tradingInsightsRef,
  }), [sentimentRef, marketRef, newsRef, historyRef, fearGreedRef, riskCalculatorRef, tradingInsightsRef]);

  const getTabRef = useCallback((tabId: string) => {
    return tabRefs[tabId as keyof typeof tabRefs] || null;
  }, [tabRefs]);

  const handleTabClick = useCallback((tabId: string) => {
    const ref = getTabRef(tabId);
    if (ref) {
      onTabChange(tabId);
      scrollToSection(ref, tabId);
      setIsMobileMenuOpen(false); // Close mobile menu after click
    }
  }, [onTabChange, scrollToSection, getTabRef]);

  const handleAuthSuccess = useCallback((user: User) => {
    onAuthSuccess(user);
    setIsAuthModalOpen(false);
  }, [onAuthSuccess]);

  const handleOpenAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLogoMouseEnter = useCallback(() => {
    setIsHoveringLogo(true);
  }, []);

  const handleLogoMouseLeave = useCallback(() => {
    setIsHoveringLogo(false);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getBorderColor = (tabId: string) => {
    switch(tabId) {
      case 'sentiment': return 'cyan';
      case 'market': return 'emerald';
      case 'tradinginsights': return 'amber';
      case 'riskcalculator': return 'purple';
      case 'news': return 'green';
      case 'history': return 'blue';
      case 'feargreed': return 'rose';
      default: return 'cyan';
    }
  };

  // RESPONSIVE: Mobile nav items (condensed)
  const mobileTabs = tabs.slice(0, 4); // Show only first 4 on mobile

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/98 to-slate-900/95 backdrop-blur-2xl border-b border-cyan-500/40 shadow-2xl shadow-cyan-500/20">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3">
        
        {/* Main Header Layout - RESPONSIVE */}
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-0">
          
          {/* Logo Section - RESPONSIVE: smaller on mobile */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={handleLogoMouseEnter}
              onMouseLeave={handleLogoMouseLeave}
            >
              <div className="relative">
                {/* RESPONSIVE: smaller logo on mobile */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/40 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <span className="text-white font-bold text-base sm:text-lg md:text-xl">Q</span>
                </div>
                
                <div className={`absolute inset-0 border border-cyan-400/30 rounded-lg md:rounded-2xl transition-all duration-1000 ${isHoveringLogo ? 'animate-ping-scale opacity-100' : 'opacity-0'}`}></div>
                
                <div className="absolute inset-0 rounded-lg md:rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </div>
            
            <div>
              {/* RESPONSIVE: smaller text on mobile */}
              <h1 className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                QuantumPulse
              </h1>
              <p className="text-cyan-300 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider hidden sm:block">
                AI Market Intelligence
              </p>
            </div>
          </div>

          {/* Status & Auth Section - RESPONSIVE */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* RESPONSIVE: hide status text on very small screens */}
            <div className="hidden sm:flex items-center space-x-1 md:space-x-2 group">
              <div className="relative">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-ping absolute"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full relative"></div>
              </div>
              <span className="text-emerald-300 text-[10px] md:text-xs font-bold hidden lg:inline">ACTIVE</span>
            </div>

            {/* RESPONSIVE: compact time display */}
            <div className="text-cyan-200 font-mono text-[10px] sm:text-xs md:text-sm bg-gradient-to-r from-cyan-500/15 to-blue-500/10 px-2 sm:px-3 py-1 md:py-1.5 rounded-lg border border-cyan-500/40">
              <span className="font-bold text-cyan-100">{currentTime || '...'}</span>
            </div>

            {/* Auth Button - RESPONSIVE */}
            {user ? (
              <UserMenu 
                user={user} 
                onLogout={onLogout} 
                onOpenAnalytics={onOpenAnalytics} 
              />
            ) : (
              <button
                onClick={handleOpenAuthModal}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-1 md:py-1.5 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button - RESPONSIVE: visible only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="block md:hidden w-8 h-8 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation - RESPONSIVE: hidden on mobile */}
        <nav className="hidden md:block mt-3 md:mt-4 bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 backdrop-blur-xl rounded-xl p-2 border border-cyan-500/30">
          <div className="flex justify-around gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const borderColor = getBorderColor(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative group flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color}/20 text-white border border-${borderColor}-400/40 shadow-lg transform scale-105`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm">{tab.icon}</span>
                    <span className="hidden lg:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Navigation Drawer - RESPONSIVE */}
        <div className={`
          md:hidden fixed top-[60px] left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-xl
          transition-all duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
          overflow-hidden
        `}>
          <div className="p-3 space-y-1">
            {mobileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color}/20 text-white border-l-2 border-cyan-400`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
            
            {/* Divider */}
            <div className="h-px bg-slate-700/50 my-2"></div>
            
            {/* User info in mobile menu when logged in */}
            {user && (
              <div className="px-4 py-2">
                <div className="text-cyan-300 text-xs font-medium">Signed in as</div>
                <div className="text-white text-sm font-semibold truncate">{user.name}</div>
                <div className="text-slate-400 text-xs truncate">{user.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </header>
  );
};

export default memo(Header);