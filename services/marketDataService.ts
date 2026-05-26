import { MarketData } from '../types';

// Top 10 Cryptocurrencies (CoinGecko IDs)
const CRYPTO_IDS = [
    'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple',
    'cardano', 'dogecoin', 'avalanche-2', 'polkadot', 'matic-network'
];

// Top 10 Stocks with realistic initial data
const stockDataState: MarketData[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: 210.50, change: 1.75, sparkline: [205, 208, 207, 209, 211, 210, 212, 211, 213, 210.5], volume: 54321000 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.25, change: 0.85, sparkline: [410, 412, 411, 414, 413, 415, 416, 414, 417, 415.25], volume: 22150000 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 175.80, change: 2.15, sparkline: [172, 173, 171, 174, 175, 176, 174, 177, 176, 175.8], volume: 31400000 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 185.15, change: 0.9, sparkline: [182, 183, 181, 184, 183, 185, 186, 184, 187, 185.15], volume: 45200000 },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: 245.60, change: -2.3, sparkline: [250, 248, 247, 245, 243, 244, 246, 245, 247, 245.6], volume: 89600000 },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 118.75, change: 3.45, sparkline: [115, 116, 114, 117, 118, 119, 117, 120, 119, 118.75], volume: 154000000 },
    { ticker: 'META', name: 'Meta Platforms', price: 485.30, change: 1.25, sparkline: [480, 482, 481, 483, 484, 485, 486, 484, 487, 485.3], volume: 14800000 },
    { ticker: 'NFLX', name: 'Netflix Inc.', price: 615.40, change: -1.15, sparkline: [620, 618, 617, 615, 613, 614, 616, 615, 617, 615.4], volume: 3500000 },
    { ticker: 'JPM', name: 'JPMorgan Chase', price: 195.80, change: 0.45, sparkline: [194, 195, 193, 196, 195, 197, 196, 198, 197, 195.8], volume: 8500000 },
    { ticker: 'V', name: 'Visa Inc.', price: 275.90, change: 0.65, sparkline: [273, 274, 272, 275, 274, 276, 275, 277, 276, 275.9], volume: 6200000 }
];

// Updated CoinGecko API URL for 10 cryptocurrencies
const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(',')}&sparkline=true&price_change_percentage=24h`;

// Cache for API responses to prevent unnecessary calls
let cryptoCache: { data: MarketData[]; timestamp: number } | null = null;
const CACHE_DURATION = 4 * 60 * 1000; // 4 minutes in milliseconds

/**
 * Updates mock stock data with realistic price fluctuations
 */
const updateMockStockData = (): MarketData[] => {
    const updatedData = stockDataState.map(asset => {
        // More realistic fluctuations based on stock volatility
        const volatility = getStockVolatility(asset.ticker);
        const randomFactor = (Math.random() - 0.5) * volatility;
        const newPrice = Math.max(asset.price * (1 + randomFactor), 1); // Prevent negative prices
        
        // Calculate new change percentage
        const basePrice = asset.sparkline[0] || asset.price;
        const newChange = ((newPrice - basePrice) / basePrice) * 100;
        
        // Update sparkline - maintain last 10 data points
        const newSparkline = [...asset.sparkline.slice(1), newPrice];

        // Slight volume fluctuation
        const currentVolume = asset.volume || 1000000;
        const volumeFactor = 1 + (Math.random() - 0.5) * 0.1;

        return {
            ...asset,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            sparkline: newSparkline,
            volume: Math.floor(currentVolume * volumeFactor),
        };
    });
    
    // Update module-level state for next call
    updatedData.forEach((asset, index) => {
        stockDataState[index] = asset;
    });

    return updatedData;
};

/**
 * Get realistic volatility based on stock ticker
 */
const getStockVolatility = (ticker: string): number => {
    const volatilityMap: { [key: string]: number } = {
        'TSLA': 0.03,  // High volatility
        'NVDA': 0.025, // Tech volatility
        'AAPL': 0.015, // Moderate
        'MSFT': 0.012, // Stable tech
        'GOOGL': 0.014,
        'AMZN': 0.016,
        'META': 0.018,
        'NFLX': 0.022,
        'JPM': 0.008,  // Banking - lower volatility
        'V': 0.007     // Financial services - stable
    };
    return volatilityMap[ticker] || 0.01; // Default 1% volatility
};

/**
 * Fetch cryptocurrency data from CoinGecko API with caching
 */
const fetchCryptoData = async (): Promise<MarketData[]> => {
    // Check cache first
    const now = Date.now();
    if (cryptoCache && (now - cryptoCache.timestamp) < CACHE_DURATION) {
        return cryptoCache.data;
    }

    try {
        const response = await fetch(COINGECKO_API_URL);
        if (!response.ok) {
            throw new Error(`CoinGecko API request failed with status ${response.status}`);
        }
        
        const cryptoApiData: any[] = await response.json();

        // FIXED: Map API response to MarketData format with NULL SAFETY
        const cryptoData = cryptoApiData.map((coin: any) => ({
            ticker: coin.symbol?.toUpperCase() || 'UNKNOWN',
            name: coin.name || 'Unknown Crypto',
            price: coin.current_price || 0, // NULL SAFETY ADDED
            change: coin.price_change_percentage_24h || 0, // NULL SAFETY ADDED
            sparkline: coin.sparkline_in_7d?.price || Array(10).fill(coin.current_price || 0), // NULL SAFETY ADDED
            volume: coin.total_volume || 0,
        }));

        // Update cache
        cryptoCache = {
            data: cryptoData,
            timestamp: now
        };

        return cryptoData;

    } catch (error) {
        console.error("Failed to fetch live crypto data from CoinGecko:", error);
        
        // Return cached data if available, otherwise fallback
        if (cryptoCache) {
            console.log("Using cached crypto data due to API error");
            return cryptoCache.data;
        }

        // Fallback data if no cache and API fails
        console.log("Using fallback crypto data");
        return CRYPTO_IDS.map(id => ({
            ticker: id.slice(0, 3).toUpperCase(),
            name: `${id.charAt(0).toUpperCase() + id.slice(1)} (API Error)`,
            price: 0,
            change: 0,
            sparkline: Array(10).fill(0),
            volume: 0,
        }));
    }
};

/**
 * Main function to fetch all market data (10 crypto + 10 stocks)
 */
export const fetchMarketData = async (): Promise<MarketData[]> => {
    try {
        // Fetch crypto and stock data in parallel for better performance
        const [cryptoData, stockData] = await Promise.all([
            fetchCryptoData(),
            Promise.resolve(updateMockStockData()) // Mock for now, can be replaced with real API
        ]);

        // Combine and return all data
        return [...cryptoData, ...stockData];

    } catch (error) {
        console.error("Critical error fetching market data:", error);
        
        // Emergency fallback - return minimal working data
        return [
            { ticker: 'BTC', name: 'Bitcoin (Error)', price: 0, change: 0, sparkline: Array(10).fill(0), volume: 0 },
            { ticker: 'ETH', name: 'Ethereum (Error)', price: 0, change: 0, sparkline: Array(10).fill(0), volume: 0 },
            { ticker: 'AAPL', name: 'Apple Inc. (Error)', price: 0, change: 0, sparkline: Array(10).fill(0), volume: 0 },
            { ticker: 'MSFT', name: 'Microsoft (Error)', price: 0, change: 0, sparkline: Array(10).fill(0), volume: 0 },
        ];
    }
};