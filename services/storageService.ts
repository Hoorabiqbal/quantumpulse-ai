import { GuestAnalysis, Analysis } from '../types';

/**
 * Storage service for guest mode using sessionStorage
 * Handles temporary storage of analyses for non-logged-in users
 * Data is automatically cleared when browser tab closes
 */

// Constants for sessionStorage keys
const GUEST_ANALYSES_KEY = 'quantumpulse-guest-analyses';
const GUEST_SESSION_KEY = 'quantumpulse-guest-session';

// Cache for performance optimization
let guestAnalysesCache: GuestAnalysis[] | null = null;
let sessionCache: { started_at: string; last_active: string } | null = null;

export const storageService = {
  /**
   * Save a guest analysis to sessionStorage
   * Guest analyses are temporary and will be cleared when tab closes
   */
  saveGuestAnalysis(analysis: Omit<Analysis, 'id' | 'user_id'>): GuestAnalysis {
    try {
      console.log('💾 Saving guest analysis to sessionStorage');
      
      // Create guest analysis with guest-specific properties
      const guestAnalysis: GuestAnalysis = {
        ...analysis,
        is_guest: true,
        local_id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        created_at: new Date().toISOString(),
      };

      // Get existing guest analyses from cache or sessionStorage
      const existingAnalyses = this.getGuestAnalyses();
      
      // Add new analysis to the beginning (most recent first)
      const updatedAnalyses = [guestAnalysis, ...existingAnalyses];
      
      // Update cache and sessionStorage
      guestAnalysesCache = updatedAnalyses;
      sessionStorage.setItem(GUEST_ANALYSES_KEY, JSON.stringify(updatedAnalyses));
      
      console.log('✅ Guest analysis saved. Total analyses:', updatedAnalyses.length);
      return guestAnalysis;
    } catch (error) {
      console.error('❌ Error saving guest analysis:', error);
      throw new Error('Failed to save analysis. Please try again.');
    }
  },

  /**
   * Get ALL guest analyses from sessionStorage
   * Returns empty array if no analyses exist or on error
   * Uses caching for better performance
   */
  getGuestAnalyses(): GuestAnalysis[] {
    try {
      // Return from cache if available
      if (guestAnalysesCache !== null) {
        return guestAnalysesCache;
      }

      const analysesJson = sessionStorage.getItem(GUEST_ANALYSES_KEY);
      
      if (!analysesJson) {
        guestAnalysesCache = [];
        return [];
      }

      const analyses = JSON.parse(analysesJson) as GuestAnalysis[];
      
      // Validate and sort by most recent first
      if (Array.isArray(analyses)) {
        const sortedAnalyses = analyses.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        guestAnalysesCache = sortedAnalyses;
        return sortedAnalyses;
      }
      
      console.warn('⚠️ Invalid guest analyses data in sessionStorage');
      guestAnalysesCache = [];
      return [];
    } catch (error) {
      console.error('❌ Error reading guest analyses:', error);
      guestAnalysesCache = [];
      return [];
    }
  },

  /**
   * Get RECENT guest analyses (limited) from sessionStorage
   * Returns only the most recent analyses up to the specified limit
   */
  getRecentGuestAnalyses(limit: number = 10): GuestAnalysis[] {
    try {
      console.log(`💾 Fetching recent ${limit} guest analyses`);
      
      const allAnalyses = this.getGuestAnalyses();
      const recentAnalyses = allAnalyses.slice(0, Math.min(limit, allAnalyses.length));
      
      console.log(`✅ Retrieved ${recentAnalyses.length} recent guest analyses`);
      return recentAnalyses;
    } catch (error) {
      console.error('❌ Error reading recent guest analyses:', error);
      return [];
    }
  },

  /**
   * Clear all guest analyses from sessionStorage
   */
  clearGuestAnalyses(): void {
    try {
      sessionStorage.removeItem(GUEST_ANALYSES_KEY);
      guestAnalysesCache = null; // Clear cache
      console.log('🧹 Guest analyses cleared from sessionStorage');
    } catch (error) {
      console.error('❌ Error clearing guest analyses:', error);
    }
  },

  /**
   * Delete a specific guest analysis by local_id
   */
  deleteGuestAnalysis(localId: string): boolean {
    try {
      const analyses = this.getGuestAnalyses();
      const filteredAnalyses = analyses.filter(analysis => analysis.local_id !== localId);
      
      if (filteredAnalyses.length === analyses.length) {
        console.warn('⚠️ Guest analysis not found for deletion:', localId);
        return false;
      }
      
      // Update cache and sessionStorage
      guestAnalysesCache = filteredAnalyses;
      sessionStorage.setItem(GUEST_ANALYSES_KEY, JSON.stringify(filteredAnalyses));
      
      console.log('✅ Guest analysis deleted:', localId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting guest analysis:', error);
      return false;
    }
  },

  /**
   * Get a specific guest analysis by local_id
   */
  getGuestAnalysis(localId: string): GuestAnalysis | null {
    try {
      const analyses = this.getGuestAnalyses();
      return analyses.find(analysis => analysis.local_id === localId) || null;
    } catch (error) {
      console.error('❌ Error getting guest analysis:', error);
      return null;
    }
  },

  /**
   * Check if guest has any analyses stored
   */
  hasGuestAnalyses(): boolean {
    return this.getGuestAnalyses().length > 0;
  },

  /**
   * Get count of ALL guest analyses
   */
  getGuestAnalysesCount(): number {
    return this.getGuestAnalyses().length;
  },

  /**
   * Get count of RECENT guest analyses (limited)
   */
  getRecentGuestAnalysesCount(limit: number = 10): number {
    return Math.min(this.getGuestAnalysesCount(), limit);
  },

  /**
   * Mark guest session as active (optional tracking)
   */
  setGuestSessionActive(): void {
    try {
      const sessionData = {
        started_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      };
      sessionCache = sessionData;
      sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('❌ Error setting guest session:', error);
    }
  },

  /**
   * Get guest session info (optional tracking)
   */
  getGuestSession(): { started_at: string; last_active: string } | null {
    try {
      // Return from cache if available
      if (sessionCache !== null) {
        return sessionCache;
      }

      const sessionJson = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (!sessionJson) return null;
      
      const sessionData = JSON.parse(sessionJson);
      sessionCache = sessionData;
      return sessionData;
    } catch (error) {
      console.error('❌ Error getting guest session:', error);
      return null;
    }
  },

  /**
   * Clear guest session data
   */
  clearGuestSession(): void {
    try {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      sessionCache = null; // Clear cache
    } catch (error) {
      console.error('❌ Error clearing guest session:', error);
    }
  },

  /**
   * Clear ALL guest data (analyses + session)
   */
  clearAllGuestData(): void {
    this.clearGuestAnalyses();
    this.clearGuestSession();
    console.log('🧹 All guest data cleared from sessionStorage');
  },

  /**
   * Initialize guest session - call this when app loads in guest mode
   */
  initializeGuestSession(): void {
    // Clear any existing guest data to start fresh
    this.clearAllGuestData();
    this.setGuestSessionActive();
    console.log('👤 Fresh guest session initialized');
  },

  /**
   * Clear cache manually (useful for testing or debugging)
   */
  clearCache(): void {
    guestAnalysesCache = null;
    sessionCache = null;
    console.log('🧹 Storage cache cleared');
  },

  /**
   * Check if sessionStorage is available
   */
  isSessionStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('⚠️ sessionStorage is not available:', error);
      return false;
    }
  }
};