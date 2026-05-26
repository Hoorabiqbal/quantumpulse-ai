import React, { useState, useCallback, useRef, useEffect } from 'react';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import MarketDashboard from './components/MarketDashboard';
import HistoryLog from './components/HistoryLog';
import LiveNewsFeed from './components/LiveNewsFeed';
import CryptoFearGreedIndex from './components/CryptoFearGreedIndex';
import TradingTips from './components/TradingTips';
import RiskCalculator from './components/RiskCalculator';
import TradingInsights from './components/TradingTips';
import Header from './components/Header';
import UserAnalyticsDashboard from './components/UserAnalyticsDashboard';
import { HistoryEntry, User, Analysis } from './types';
import { authService } from './services/authService';
import { analysisService } from './services/analysisService';
import { storageService } from './services/storageService';

function App() {
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [activeTab, setActiveTab] = useState('sentiment');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const sentimentRef = useRef<HTMLDivElement>(null);
  const marketRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const fearGreedRef = useRef<HTMLDivElement>(null);
  const riskCalculatorRef = useRef<HTMLDivElement>(null);
  const tradingInsightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== OPTIMIZED AUTH STATE MANAGEMENT ====================
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Checking for existing user session...');
        const result = await authService.getCurrentUser();
        
        if (result.success && result.data) {
          console.log('✅ User session found:', result.data.email);
          setUser(result.data);
          await loadRecentAnalyses(result.data);
        } else {
          console.log('👤 No user session found, initializing guest mode');
          setRecentAnalyses([]);
          storageService.initializeGuestSession();
          console.log('🔄 Fresh guest session initialized');
          await loadRecentGuestAnalyses();
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setRecentAnalyses([]);
        storageService.initializeGuestSession();
        console.log('🔄 Guest session initialized after error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadRecentAnalyses = useCallback(async (currentUser: User) => {
    try {
      console.log('📂 Loading RECENT user analyses (10 max)...');
      const result = await analysisService.getRecentAnalyses(currentUser, 10);
      
      if (result.success && result.data) {
        console.log(`✅ Loaded ${result.data.length} recent user analyses`);
        setRecentAnalyses(result.data);
      } else {
        console.error('❌ Failed to load recent analyses:', result.error);
        setRecentAnalyses([]);
      }
    } catch (error) {
      console.error('❌ Error loading recent analyses:', error);
      setRecentAnalyses([]);
    }
  }, []);

  const loadRecentGuestAnalyses = useCallback(async () => {
    try {
      console.log('💾 Loading RECENT guest analyses (10 max)...');
      const result = await analysisService.getRecentAnalyses(null, 10);
      
      if (result.success && result.data) {
        console.log(`✅ Loaded ${result.data.length} recent guest analyses`);
        setRecentAnalyses(result.data);
      } else {
        console.error('❌ Failed to load recent guest analyses:', result.error);
        setRecentAnalyses([]);
      }
    } catch (error) {
      console.error('❌ Error loading recent guest analyses:', error);
      setRecentAnalyses([]);
    }
  }, []);

  const handleAuthSuccess = useCallback(async (userData: User) => {
    try {
      console.log('✅ Auth success, setting user:', userData.email);
      setUser(userData);
      analysisService.clearGuestData();
      console.log('🧹 Cleared guest data after login');
      await loadRecentAnalyses(userData);
    } catch (error) {
      console.error('❌ Error handling auth success:', error);
    }
  }, [loadRecentAnalyses]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 User logging out...');
      setUser(null);
      setRecentAnalyses([]);
      storageService.initializeGuestSession();
      console.log('👤 Switched to fresh guest mode');
      await loadRecentGuestAnalyses();
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }, [loadRecentGuestAnalyses]);

  const handleOpenAnalytics = useCallback(() => {
    if (!user) {
      console.log('⚠️ Analytics dashboard requires user login');
      return;
    }
    console.log('📊 Opening analytics dashboard for:', user.name);
    setIsAnalyticsOpen(true);
  }, [user]);

  const handleNewAnalysis = useCallback(async (entry: HistoryEntry) => {
    try {
      const analysisData = analysisService.convertHistoryToAnalysis(entry);
      console.log('💾 Saving new analysis for:', user ? user.email : 'guest');
      const result = await analysisService.saveAnalysis(analysisData, user);
      
      if (result.success && result.data) {
        console.log('✅ Analysis saved successfully');
        setRecentAnalyses(prev => {
          const newList = [result.data!, ...prev];
          return newList.slice(0, 10);
        });
      } else {
        console.error('❌ Failed to save analysis:', result.error);
      }
    } catch (error) {
      console.error('❌ Error in handleNewAnalysis:', error);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const subscription = authService.onAuthStateChange(async (currentUser) => {
      if (!isMounted) return;
      console.log('🔄 Auth state changed:', currentUser ? currentUser.email : 'logged out');
      if (currentUser) {
        setUser(currentUser);
        await loadRecentAnalyses(currentUser);
      } else {
        setUser(null);
        await loadRecentGuestAnalyses();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadRecentAnalyses, loadRecentGuestAnalyses]);

  const scrollToSection = useCallback((sectionRef: React.RefObject<HTMLDivElement>, tabId: string) => {
    setActiveTab(tabId);
    sectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-cyan-500/30 z-50 md:hidden">
      <div className="flex justify-around p-2">
        {[
          { id: 'sentiment', icon: '📊', label: 'Analyze', ref: sentimentRef },
          { id: 'market', icon: '📈', label: 'Market', ref: marketRef },
          { id: 'news', icon: '📰', label: 'News', ref: newsRef },
          { id: 'history', icon: '📜', label: 'History', ref: historyRef },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.ref, tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all min-h-[44px] ${
              activeTab === tab.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
          <p className="text-cyan-300 text-base md:text-lg font-semibold">Loading QuantumPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 relative overflow-hidden pb-16 md:pb-0">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-40 md:w-80 h-40 md:h-80 bg-cyan-500/10 rounded-full blur-3xl animate-orb-float"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:80px_80px]"></div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(isMobile ? 6 : 12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-cyan-400/30 rounded-full animate-magic-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Header 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollToSection={scrollToSection}
          sentimentRef={sentimentRef}
          marketRef={marketRef}
          newsRef={newsRef}
          historyRef={historyRef}
          fearGreedRef={fearGreedRef}
          riskCalculatorRef={riskCalculatorRef}
          tradingInsightsRef={tradingInsightsRef}
          user={user}
          onAuthSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onOpenAnalytics={handleOpenAnalytics}
        />

        {user && (
          <UserAnalyticsDashboard
            user={user}
            isOpen={isAnalyticsOpen}
            onClose={() => setIsAnalyticsOpen(false)}
          />
        )}

        <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 mx-auto max-w-7xl">
          
          {/* ========== HERO SECTION - 2-4-2 Grid (Desktop) / Stack (Mobile) ========== */}
          <div ref={tradingInsightsRef} className="grid grid-cols-1 lg:grid-cols-8 gap-4 md:gap-6 mb-8 md:mb-16 items-start">
            {/* Trading Insights - Left */}
            <div className="lg:col-span-2 order-3 lg:order-1">
              <TradingInsights />
            </div>

            {/* Hero Center */}
            <div className="lg:col-span-4 order-1 lg:order-2">
              <div className="text-center space-y-4 md:space-y-6">
                <div className="inline-flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-xl border border-cyan-500/30 mx-auto">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-400 text-xs md:text-sm font-bold tracking-wider">INSTITUTIONAL GRADE</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                  AI-Powered
                  <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mt-1 md:mt-2">
                    Market Intelligence
                  </span>
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg text-cyan-100/90 leading-relaxed font-light max-w-2xl mx-auto px-2">
                  QuantumPulse delivers real-time sentiment analysis and predictive insights powered by advanced AI.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-2 md:mt-4 px-4">
                  <button 
                    onClick={() => {
                      setActiveTab('sentiment');
                      setTimeout(() => sentimentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-semibold md:font-bold text-sm md:text-base"
                  >
                    Start Analyzing Now →
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('tradinginsights');
                      setTimeout(() => tradingInsightsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="px-4 md:px-6 py-2 md:py-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-xl text-cyan-300 font-semibold text-sm md:text-base"
                  >
                    View Insights 💡
                  </button>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 border border-cyan-500/20 max-w-2xl mx-auto w-full">
                  <p className="text-xs sm:text-sm md:text-base text-cyan-100 leading-relaxed text-center italic">
                    "Financial headlines move markets. Our AI decodes sentiment in real-time."
                  </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-2">
                  {(isMobile ? [
                    { icon: '🤖', label: 'AI' },
                    { icon: '📈', label: 'Real-time' },
                  ] : [
                    { icon: '🤖', label: 'AI-Powered' },
                    { icon: '📈', label: 'Real-time' },
                    { icon: '⚡', label: 'Institutional' },
                    { icon: '🔮', label: 'Predictive' }
                  ]).map((feature) => (
                    <div key={feature.label} className="flex flex-col items-center p-2 md:p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex-1 max-w-20 md:max-w-28">
                      <span className="text-xl md:text-2xl">{feature.icon}</span>
                      <span className="text-cyan-100 text-xs font-semibold tracking-wide mt-1">{feature.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center gap-2 md:gap-3 pt-2 md:pt-4 border-t border-slate-700/50">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-[10px] md:text-xs font-semibold tracking-wider">LIVE DATA</span>
                </div>
              </div>
            </div>
            
            {/* Crypto Fear & Greed - Right */}
            <div className="lg:col-span-2 order-2 lg:order-3">
              <CryptoFearGreedIndex />
            </div>
          </div>

          {/* ========== 2-4-2 GRID (Desktop) / Stack (Mobile) ========== */}
          <div ref={sentimentRef} className="grid grid-cols-1 lg:grid-cols-8 gap-4 md:gap-6 mb-8 md:mb-16">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <RiskCalculator />
            </div>
            <div className="lg:col-span-4 order-1 lg:order-2">
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-cyan-500/40 p-1.5 md:p-2">
                <SentimentAnalyzer onNewAnalysis={handleNewAnalysis} user={user} />
              </div>
            </div>
            <div ref={newsRef} className="lg:col-span-2 order-3 lg:order-3">
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-green-500/40 p-1.5 md:p-2">
                <LiveNewsFeed />
              </div>
            </div>
          </div>

          {/* ========== MARKET DASHBOARD ========== */}
          <div ref={marketRef} className="mb-8 md:mb-16">
            <MarketDashboard />
          </div>

          {/* ========== HISTORY LOG ========== */}
          <div ref={historyRef} className="mb-8 md:mb-16">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-purple-500/40 p-1.5 md:p-2">
              <HistoryLog analyses={recentAnalyses} user={user} />
            </div>
          </div>
        </main>

        <footer className="relative border-t border-cyan-500/30 bg-slate-900/90 backdrop-blur-2xl mt-8 md:mt-16">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-base md:text-lg">Q</span>
                </div>
                <div>
                  <p className="text-cyan-400 font-bold text-base md:text-xl">QuantumPulse</p>
                  {!isMobile && <p className="text-gray-400 text-xs md:text-sm mt-1">Advanced AI Analytics</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4 bg-green-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-green-500/30">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-[10px] md:text-sm font-bold">SYSTEM OPTIMAL</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <BottomNav />

      <style>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -10px) scale(1.05); }
        }
        @keyframes magic-float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(1.1); opacity: 0.6; }
        }
        .animate-orb-float { animation: orb-float 15s ease-in-out infinite; }
        .animate-magic-float { animation: magic-float 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default App;