import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import { Analysis, GuestAnalysis, ServiceResponse, User } from '../types';

/**
 * Unified analysis service that handles both:
 * - Guest mode: Uses localStorage via storageService
 * - User mode: Uses Supabase database
 * Provides a consistent interface regardless of auth state
 */

export const analysisService = {
  /**
   * Save analysis - automatically routes to correct storage based on auth state
   */
  async saveAnalysis(
    analysis: Omit<Analysis, 'id' | 'user_id' | 'created_at'>,
    user: User | null
  ): Promise<ServiceResponse<Analysis>> {
    try {
      console.log('💾 Saving analysis for user:', user ? user.email : 'guest');
      
      if (user) {
        // User is logged in - save to Supabase
        return await this.saveUserAnalysis(analysis, user.id);
      } else {
        // User is guest - save to localStorage
        return await this.saveGuestAnalysis(analysis);
      }
    } catch (error) {
      console.error('❌ Error saving analysis:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to save analysis',
        success: false,
      };
    }
  },

  /**
   * Save analysis for logged-in user to Supabase
   * Matches database schema: analyses table with columns:
   * - input_text (text)
   * - sentiment (numeric: 0.7 bullish, -0.7 bearish, 0 neutral)
   * - confidence (text)
   * - reasoning (text)
   * - sector (text)
   */
  async saveUserAnalysis(
    analysis: Omit<Analysis, 'id' | 'user_id' | 'created_at'>,
    userId: string
  ): Promise<ServiceResponse<Analysis>> {
    try {
      console.log('🗄️ Saving user analysis to Supabase for user:', userId);
      console.log('📊 Analysis data received:', analysis);
      
      // Convert sentiment string to numeric value for database
      let sentimentNumeric = 0; // neutral
      if (analysis.sentiment === 'bullish') sentimentNumeric = 0.7;
      if (analysis.sentiment === 'bearish') sentimentNumeric = -0.7;
      
      // Map your data to match database schema
      const analysisData = {
        user_id: userId,
        input_text: analysis.news_text,  // Map news_text to input_text
        sentiment: sentimentNumeric,      // Convert to number
        confidence: analysis.confidence?.toString() || '0.5', // Convert to string
        reasoning: analysis.keywords?.join(', ') || 'No reasoning provided',
        sector: 'General',                // Default sector
        created_at: new Date().toISOString(),
      };

      console.log('📝 Data being saved to Supabase:', analysisData);

      const { data, error } = await supabase
        .from('analyses')
        .insert(analysisData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error.message);
        console.error('❌ Full error details:', error);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      console.log('✅ User analysis saved to Supabase with ID:', data.id);
      console.log('📊 Saved data:', data);
      
      // Transform database response back to your Analysis type
      const transformedAnalysis: Analysis = {
        id: data.id,
        user_id: data.user_id,
        news_text: data.input_text,
        sentiment: data.sentiment > 0.3 ? 'bullish' : data.sentiment < -0.3 ? 'bearish' : 'neutral',
        confidence: parseFloat(data.confidence) || 0.5,
        keywords: data.reasoning?.split(', ') || [],
        created_at: data.created_at,
        is_guest: false,
      };
      
      return {
        data: transformedAnalysis,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Unexpected error saving user analysis:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to save analysis to database',
        success: false,
      };
    }
  },

  /**
   * Save analysis for guest user to localStorage
   */
  async saveGuestAnalysis(
    analysis: Omit<Analysis, 'id' | 'user_id' | 'created_at'>
  ): Promise<ServiceResponse<Analysis>> {
    try {
      console.log('💾 Saving guest analysis to localStorage');
      
      // Add created_at for guest analysis
      const guestAnalysisData = {
        ...analysis,
        created_at: new Date().toISOString(),
      };
      
      const guestAnalysis = storageService.saveGuestAnalysis(guestAnalysisData);
      
      console.log('✅ Guest analysis saved to localStorage with ID:', guestAnalysis.local_id);
      
      return {
        data: guestAnalysis as Analysis,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Error saving guest analysis:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to save guest analysis',
        success: false,
      };
    }
  },

  /**
   * Get RECENT analyses (limited to 10) - for initial display
   */
  async getRecentAnalyses(user: User | null, limit: number = 10): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log(`📂 Fetching recent ${limit} analyses for:`, user ? user.email : 'guest');
      
      if (user) {
        // User is logged in - get from Supabase with limit
        return await this.getRecentUserAnalyses(user.id, limit);
      } else {
        // User is guest - get from localStorage with limit
        return await this.getRecentGuestAnalyses(limit);
      }
    } catch (error) {
      console.error('❌ Error fetching recent analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch recent analyses',
        success: false,
      };
    }
  },

  /**
   * Get ALL analyses - for search functionality
   */
  async getAnalyses(user: User | null): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log('📂 Fetching ALL analyses for:', user ? user.email : 'guest');
      
      if (user) {
        // User is logged in - get ALL from Supabase
        return await this.getUserAnalyses(user.id);
      } else {
        // User is guest - get ALL from localStorage
        return await this.getGuestAnalyses();
      }
    } catch (error) {
      console.error('❌ Error fetching analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch analyses',
        success: false,
      };
    }
  },

  /**
   * Get RECENT analyses for logged-in user from Supabase (limited)
   */
  async getRecentUserAnalyses(userId: string, limit: number = 10): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log(`🗄️ Fetching recent ${limit} user analyses from Supabase for user:`, userId);
      
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Supabase fetch error:', error.message);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      console.log(`✅ Retrieved ${data?.length || 0} recent user analyses from Supabase`);
      console.log('📊 Data sample:', data);
      
      // Transform database response to your Analysis type
      const transformedAnalyses: Analysis[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        news_text: item.input_text,
        sentiment: item.sentiment > 0.3 ? 'bullish' : item.sentiment < -0.3 ? 'bearish' : 'neutral',
        confidence: parseFloat(item.confidence) || 0.5,
        keywords: item.reasoning?.split(', ') || [],
        created_at: item.created_at,
        is_guest: false,
      }));
      
      return {
        data: transformedAnalyses,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Unexpected error fetching recent user analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch recent analyses from database',
        success: false,
      };
    }
  },

  /**
   * Get ALL analyses for logged-in user from Supabase
   */
  async getUserAnalyses(userId: string): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log('🗄️ Fetching ALL user analyses from Supabase for user:', userId);
      
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch error:', error.message);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      console.log(`✅ Retrieved ${data?.length || 0} user analyses from Supabase`);
      
      // Transform database response to your Analysis type
      const transformedAnalyses: Analysis[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        news_text: item.input_text,
        sentiment: item.sentiment > 0.3 ? 'bullish' : item.sentiment < -0.3 ? 'bearish' : 'neutral',
        confidence: parseFloat(item.confidence) || 0.5,
        keywords: item.reasoning?.split(', ') || [],
        created_at: item.created_at,
        is_guest: false,
      }));
      
      return {
        data: transformedAnalyses,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Unexpected error fetching user analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch analyses from database',
        success: false,
      };
    }
  },

  /**
   * Get RECENT analyses for guest user from localStorage (limited)
   */
  async getRecentGuestAnalyses(limit: number = 10): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log(`💾 Fetching recent ${limit} guest analyses from localStorage`);
      
      const analyses = storageService.getRecentGuestAnalyses(limit);
      
      console.log(`✅ Retrieved ${analyses.length} recent guest analyses from localStorage`);
      
      return {
        data: analyses as Analysis[],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Error fetching recent guest analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch recent guest analyses',
        success: false,
      };
    }
  },

  /**
   * Get ALL analyses for guest user from localStorage
   */
  async getGuestAnalyses(): Promise<ServiceResponse<Analysis[]>> {
    try {
      console.log('💾 Fetching ALL guest analyses from localStorage');
      
      const analyses = storageService.getGuestAnalyses();
      
      console.log(`✅ Retrieved ${analyses.length} guest analyses from localStorage`);
      
      return {
        data: analyses as Analysis[],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Error fetching guest analyses:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch guest analyses',
        success: false,
      };
    }
  },

  /**
   * Delete analysis - routes to correct storage based on analysis type
   */
  async deleteAnalysis(analysis: Analysis, user: User | null): Promise<ServiceResponse<boolean>> {
    try {
      console.log('🗑️ Deleting analysis:', analysis.id || (analysis as GuestAnalysis).local_id);
      
      if (analysis.is_guest) {
        // Guest analysis - delete from localStorage
        const guestAnalysis = analysis as GuestAnalysis;
        const success = storageService.deleteGuestAnalysis(guestAnalysis.local_id);
        
        return {
          data: success,
          error: success ? null : 'Failed to delete guest analysis',
          success,
        };
      } else if (user && analysis.user_id === user.id) {
        // User analysis - delete from Supabase
        return await this.deleteUserAnalysis(analysis.id!);
      } else {
        console.error('❌ Cannot delete analysis: User mismatch or invalid analysis');
        return {
          data: false,
          error: 'Cannot delete analysis: User mismatch or invalid analysis',
          success: false,
        };
      }
    } catch (error) {
      console.error('❌ Error deleting analysis:', error);
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Failed to delete analysis',
        success: false,
      };
    }
  },

  /**
   * Delete user analysis from Supabase
   */
  async deleteUserAnalysis(analysisId: string): Promise<ServiceResponse<boolean>> {
    try {
      console.log('🗑️ Deleting user analysis from Supabase:', analysisId);
      
      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.error('❌ Supabase delete error:', error.message);
        return {
          data: false,
          error: error.message,
          success: false,
        };
      }

      console.log('✅ User analysis deleted from Supabase:', analysisId);
      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Unexpected error deleting user analysis:', error);
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Failed to delete analysis from database',
        success: false,
      };
    }
  },

  /**
   * Clear all guest analyses when user logs in
   */
  clearGuestData(): void {
    console.log('🧹 Clearing all guest data during login');
    storageService.clearAllGuestData();
  },

  /**
   * Get analysis count for current user/guest
   */
  async getAnalysisCount(user: User | null): Promise<number> {
    try {
      const response = await this.getAnalyses(user);
      return response.data?.length || 0;
    } catch (error) {
      console.error('❌ Error getting analysis count:', error);
      return 0;
    }
  },

  /**
   * Get recent analysis count (limited)
   */
  async getRecentAnalysisCount(user: User | null): Promise<number> {
    try {
      const response = await this.getRecentAnalyses(user);
      return response.data?.length || 0;
    } catch (error) {
      console.error('❌ Error getting recent analysis count:', error);
      return 0;
    }
  },

  /**
   * Check if user has any analyses
   */
  async hasAnalyses(user: User | null): Promise<boolean> {
    return (await this.getAnalysisCount(user)) > 0;
  },

  /**
   * Convert legacy HistoryEntry to Analysis format (for migration if needed)
   */
  convertHistoryToAnalysis(history: any): Omit<Analysis, 'id' | 'user_id' | 'created_at'> {
    return {
      news_text: history.input || history.text || '',
      sentiment: analysisService.mapSentimentToAnalysis(history.sentiment),
      confidence: history.confidence || 0.5,
      keywords: analysisService.extractKeywords(history.reasoning || ''),
    };
  },

  /**
   * Map legacy sentiment to analysis sentiment
   */
  mapSentimentToAnalysis(sentiment: string): 'bullish' | 'bearish' | 'neutral' {
    if (sentiment?.toLowerCase().includes('bull')) return 'bullish';
    if (sentiment?.toLowerCase().includes('bear')) return 'bearish';
    return 'neutral';
  },

  /**
   * Extract keywords from reasoning text
   */
  extractKeywords(reasoning: string): string[] {
    if (!reasoning) return [];
    
    // Simple keyword extraction - you can enhance this
    const words = reasoning.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10); // Limit to 10 keywords
  }
};