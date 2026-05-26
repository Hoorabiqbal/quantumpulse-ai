import { supabase } from './supabaseClient';
import { UserAnalytics, SentimentDistribution, TimelineData, KeywordFrequency, PerformanceMetrics, AnalyticsServiceResponse, Analysis } from '../types';

/**
 * Analytics Service for User Dashboard
 * Provides comprehensive analytics based on user's analysis history
 * Optimized for performance and memory efficiency
 * FIXED: Properly handles numeric sentiment values from database
 */
export const analyticsService = {
  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(userId: string): Promise<AnalyticsServiceResponse> {
    try {
      console.log('📊 Fetching user analytics for:', userId);

      if (!this.isValidUserId(userId)) {
        console.error('❌ Invalid user ID format');
        return {
          data: this.getEmptyAnalytics(),
          error: null,
          success: true,
        };
      }

      // Execute all analytics queries in parallel for maximum performance
      const [
        sentimentDistribution,
        timelineData,
        keywordAnalysis,
        recentAnalyses,
        totalAnalyses
      ] = await Promise.all([
        this.getSentimentDistribution(userId),
        this.getTimelineData(userId),
        this.getKeywordAnalysis(userId),
        this.getRecentAnalyses(userId, 10),
        this.getTotalAnalysisCount(userId)
      ]);

      // Calculate performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(userId, totalAnalyses);

      const analytics: UserAnalytics = {
        sentimentDistribution,
        timelineData,
        topKeywords: keywordAnalysis,
        performanceMetrics,
        recentAnalyses
      };

      console.log('✅ User analytics fetched successfully');
      return {
        data: analytics,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('❌ Error fetching user analytics:', error);
      return {
        data: this.getEmptyAnalytics(),
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        success: false,
      };
    }
  },

  /**
   * Get empty analytics for new users
   */
  getEmptyAnalytics(): UserAnalytics {
    return {
      sentimentDistribution: { bullish: 0, bearish: 0, neutral: 0 },
      timelineData: [],
      topKeywords: [],
      performanceMetrics: {
        averageConfidence: 0,
        consistencyScore: 0,
        mostActivePeriod: 'No data',
        totalAnalyses: 0
      },
      recentAnalyses: []
    };
  },

  /**
   * Get sentiment distribution (bullish/bearish/neutral counts)
   * FIXED: Properly handles numeric sentiment values (-0.7, 0, 0.7)
   */
  async getSentimentDistribution(userId: string): Promise<SentimentDistribution> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('sentiment')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching sentiment distribution:', error);
        return { bullish: 0, bearish: 0, neutral: 0 };
      }

      if (!data || data.length === 0) {
        return { bullish: 0, bearish: 0, neutral: 0 };
      }

      // Efficient counting using reduce - handles numeric sentiment values
      const distribution = data.reduce((acc, analysis) => {
        const sentimentValue = analysis.sentiment;
        
        // Convert numeric sentiment to category
        // Values: -0.7 = bearish, 0 = neutral, 0.7 = bullish
        if (sentimentValue > 0.3) {
          acc.bullish++;
        } else if (sentimentValue < -0.3) {
          acc.bearish++;
        } else {
          acc.neutral++;
        }
        return acc;
      }, { bullish: 0, bearish: 0, neutral: 0 });

      console.log('📈 Sentiment distribution:', distribution);
      return distribution;
    } catch (error) {
      console.error('❌ Unexpected error in sentiment distribution:', error);
      return { bullish: 0, bearish: 0, neutral: 0 };
    }
  },

  /**
   * Get timeline data for analysis activity
   */
  async getTimelineData(userId: string): Promise<TimelineData[]> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching timeline data:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by date efficiently
      const dateCounts = new Map<string, number>();
      
      data.forEach(analysis => {
        if (analysis.created_at) {
          const date = new Date(analysis.created_at).toISOString().split('T')[0];
          dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
        }
      });

      // Convert to sorted array
      const timeline = Array.from(dateCounts.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      console.log('📅 Timeline data points:', timeline.length);
      return timeline;
    } catch (error) {
      console.error('❌ Unexpected error in timeline data:', error);
      return [];
    }
  },

  /**
   * Get keyword frequency analysis
   * FIXED: Extracts keywords from reasoning field since database doesn't have keywords column
   */
  async getKeywordAnalysis(userId: string): Promise<KeywordFrequency[]> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('reasoning')
        .eq('user_id', userId)
        .not('reasoning', 'is', null);

      if (error) {
        console.error('❌ Error fetching keyword data:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Extract keywords from reasoning text
      const keywordMap = new Map<string, number>();
      const stopWords = new Set([
        'the', 'and', 'for', 'are', 'with', 'this', 'that', 'from', 'have',
        'will', 'may', 'can', 'could', 'would', 'should', 'what', 'which',
        'their', 'they', 'there', 'been', 'being', 'was', 'were', 'has',
        'had', 'having', 'but', 'not', 'all', 'any', 'both', 'each',
        'more', 'most', 'some', 'such', 'than', 'then', 'these', 'those',
        'very', 'just', 'but', 'do', 'does', 'did', 'doing'
      ]);

      data.forEach(analysis => {
        if (analysis.reasoning) {
          const words = analysis.reasoning
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((word: string) => 
              word.length > 3 && 
              !stopWords.has(word) &&
              !word.match(/^\d+$/)
            );
          
          words.forEach((word: string) => {
            keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
          });
        }
      });

      // Convert to sorted array and limit to top 10
      const topKeywords = Array.from(keywordMap.entries())
        .map(([keyword, frequency]) => ({ keyword, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      console.log('🔤 Top keywords found:', topKeywords.length);
      return topKeywords;
    } catch (error) {
      console.error('❌ Unexpected error in keyword analysis:', error);
      return [];
    }
  },

  /**
   * Get recent analyses for the dashboard
   */
  async getRecentAnalyses(userId: string, limit: number = 5): Promise<Analysis[]> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent analyses:', error);
        return [];
      }

      if (!data) return [];

      // Transform database response to Analysis type
      const transformedAnalyses: Analysis[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        news_text: item.input_text,
        sentiment: item.sentiment > 0.3 ? 'bullish' : item.sentiment < -0.3 ? 'bearish' : 'neutral',
        confidence: parseFloat(item.confidence) || 0.5,
        keywords: item.reasoning?.split(', ') || [],
        created_at: item.created_at,
        is_guest: false,
      }));

      console.log('📝 Recent analyses fetched:', transformedAnalyses.length);
      return transformedAnalyses;
    } catch (error) {
      console.error('❌ Unexpected error fetching recent analyses:', error);
      return [];
    }
  },

  /**
   * Get total analysis count
   */
  async getTotalAnalysisCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error counting analyses:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Unexpected error counting analyses:', error);
      return 0;
    }
  },

  /**
   * Calculate performance metrics
   * FIXED: Properly handles confidence values
   */
  async calculatePerformanceMetrics(userId: string, totalAnalyses: number): Promise<PerformanceMetrics> {
    try {
      if (totalAnalyses === 0) {
        return this.getDefaultPerformanceMetrics(0);
      }

      // Get average confidence
      const { data, error } = await supabase
        .from('analyses')
        .select('confidence')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        console.error('❌ Error calculating performance metrics:', error);
        return this.getDefaultPerformanceMetrics(totalAnalyses);
      }

      // Convert confidence from string to number
      let totalConfidence = 0;
      let confidenceValues: number[] = [];
      
      data.forEach(analysis => {
        const confidence = parseFloat(analysis.confidence) || 50;
        totalConfidence += confidence;
        confidenceValues.push(confidence);
      });
      
      const averageConfidence = totalConfidence / data.length;

      // Calculate consistency score (based on standard deviation)
      const variance = confidenceValues.reduce((sum, val) => {
        return sum + Math.pow(val - averageConfidence, 2);
      }, 0) / confidenceValues.length;
      
      const stdDev = Math.sqrt(variance);
      // Consistency score: higher is better (less variance)
      const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 1.5)));

      // Determine most active period
      const mostActivePeriod = await this.getMostActivePeriod(userId);

      return {
        averageConfidence: Math.round(averageConfidence),
        consistencyScore: Math.round(consistencyScore),
        mostActivePeriod,
        totalAnalyses
      };
    } catch (error) {
      console.error('❌ Unexpected error calculating metrics:', error);
      return this.getDefaultPerformanceMetrics(totalAnalyses);
    }
  },

  /**
   * Get user's most active time period
   */
  async getMostActivePeriod(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('created_at')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        return 'Not enough data';
      }

      // Count analyses by hour of day
      const hourCounts = new Array(24).fill(0);
      
      data.forEach(analysis => {
        if (analysis.created_at) {
          const hour = new Date(analysis.created_at).getHours();
          hourCounts[hour]++;
        }
      });

      const maxCount = Math.max(...hourCounts);
      if (maxCount === 0) return 'Not enough data';
      
      const maxHour = hourCounts.indexOf(maxCount);
      
      // Categorize by time of day
      if (maxHour >= 5 && maxHour < 12) return 'Morning (5AM-12PM)';
      if (maxHour >= 12 && maxHour < 17) return 'Afternoon (12PM-5PM)';
      if (maxHour >= 17 && maxHour < 21) return 'Evening (5PM-9PM)';
      return 'Night (9PM-5AM)';

    } catch (error) {
      console.error('❌ Error determining active period:', error);
      return 'Unknown';
    }
  },

  /**
   * Default performance metrics for error cases or no data
   */
  getDefaultPerformanceMetrics(totalAnalyses: number): PerformanceMetrics {
    return {
      averageConfidence: 0,
      consistencyScore: 0,
      mostActivePeriod: totalAnalyses === 0 ? 'No analyses yet' : 'Insufficient data',
      totalAnalyses
    };
  },

  /**
   * Clear analytics cache (if implementing caching in future)
   */
  clearCache(): void {
    console.log('🧹 Analytics cache cleared');
  },

  /**
   * Validate user ID before making queries
   */
  isValidUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') return false;
    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  }
};