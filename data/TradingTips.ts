import { TradingTip } from '../types';

export const tradingTips: TradingTip[] = [
  // Trading Psychology (10 tips)
  {
    id: 1,
    category: 'psychology',
    title: 'Trade Your Plan',
    content: 'Plan your trade and trade your plan. Emotional decisions lead to inconsistent results and losses.',
    author: 'Market Wisdom',
    difficulty: 'beginner'
  },
  {
    id: 2,
    category: 'psychology',
    title: 'Emotional Control',
    content: 'The market doesn\'t care about your hopes or fears. Remove emotion and trade based on logic and analysis.',
    difficulty: 'intermediate'
  },
  {
    id: 3,
    category: 'psychology',
    title: 'Patience Pays',
    content: 'Wait for your setup. The market will always provide opportunities. Missing one is better than taking a bad trade.',
    difficulty: 'intermediate'
  },
  {
    id: 4,
    category: 'psychology',
    title: 'Avoid Revenge Trading',
    content: 'Never trade to recover losses. This leads to overtrading and larger losses. Take a break instead.',
    difficulty: 'intermediate'
  },
  {
    id: 5,
    category: 'psychology',
    title: 'Accept Small Losses',
    content: 'Losses are part of trading. The key is to keep them small and learn from each one. Protect your capital.',
    difficulty: 'beginner'
  },

  // Risk Management (10 tips)
  {
    id: 6,
    category: 'risk',
    title: '1% Rule',
    content: 'Never risk more than 1% of your trading capital on a single trade. This ensures longevity in the markets.',
    difficulty: 'beginner'
  },
  {
    id: 7,
    category: 'risk',
    title: 'Risk-Reward Ratio',
    content: 'Always aim for minimum 1:2 risk-reward ratio. Better opportunities always come - be selective.',
    difficulty: 'beginner'
  },
  {
    id: 8,
    category: 'risk',
    title: 'Position Sizing',
    content: 'Size positions based on stop-loss distance. Closer stop = larger position, wider stop = smaller position.',
    difficulty: 'intermediate'
  },
  {
    id: 9,
    category: 'risk',
    title: 'Stop Loss Strategy',
    content: 'Place stops at logical technical levels, not arbitrary percentages. This prevents being stopped out by noise.',
    difficulty: 'intermediate'
  },
  {
    id: 10,
    category: 'risk',
    title: 'Portfolio Diversification',
    content: 'Avoid holding highly correlated positions. Diversify across different sectors and asset classes.',
    difficulty: 'advanced'
  },

  // Trading Strategies (10 tips)
  {
    id: 11,
    category: 'strategy',
    title: 'Trend Following',
    content: 'Ride the trend until technical evidence shows reversal. Don\'t try to pick tops and bottoms.',
    author: 'Classic Strategy',
    difficulty: 'intermediate'
  },
  {
    id: 12,
    category: 'strategy',
    title: 'Support & Resistance',
    content: 'Price tends to react at previous support and resistance levels. These are high-probability areas for entries.',
    difficulty: 'beginner'
  },
  {
    id: 13,
    category: 'strategy',
    title: 'Breakout Trading',
    content: 'Wait for price to break key levels, then retest as support/resistance before entering. Filters false breakouts.',
    difficulty: 'advanced'
  },
  {
    id: 14,
    category: 'strategy',
    title: 'Multiple Timeframe Analysis',
    content: 'Analyze weekly for trend, daily for direction, 4H for timing. Never trade based on single timeframe.',
    difficulty: 'intermediate'
  },
  {
    id: 15,
    category: 'strategy',
    title: 'Market Regime Awareness',
    content: 'Adjust strategy based on conditions: trending, ranging, high volatility, low volatility.',
    difficulty: 'advanced'
  },

  // Investment Principles (10 tips)
  {
    id: 16,
    category: 'investment',
    title: 'Long-term Compounding',
    content: 'Real wealth is built through compounding over decades, not months. Be patient and consistent.',
    author: 'Warren Buffett',
    difficulty: 'beginner'
  },
  {
    id: 17,
    category: 'investment',
    title: 'Dollar-Cost Averaging',
    content: 'Invest fixed amounts regularly regardless of market conditions. Reduces timing risk and emotional decisions.',
    difficulty: 'beginner'
  },
  {
    id: 18,
    category: 'investment',
    title: 'Margin of Safety',
    content: 'Always buy with a margin of safety. The difference between price and intrinsic value is your protection.',
    author: 'Benjamin Graham',
    difficulty: 'intermediate'
  },
  {
    id: 19,
    category: 'investment',
    title: 'Circle of Competence',
    content: 'Only invest in businesses you understand deeply. Know what you know and what you don\'t know.',
    author: 'Warren Buffett',
    difficulty: 'beginner'
  },
  {
    id: 20,
    category: 'investment',
    title: 'Quality Over Quantity',
    content: 'Better to own a few excellent companies than many mediocre ones. Focus on quality businesses with moats.',
    author: 'Charlie Munger',
    difficulty: 'intermediate'
  },

  // Technical Analysis (10 tips)
  {
    id: 21,
    category: 'technical',
    title: 'Volume Confirmation',
    content: 'Always confirm price movements with volume. Breakouts on low volume are often false breakouts.',
    difficulty: 'intermediate'
  },
  {
    id: 22,
    category: 'technical',
    title: 'RSI Divergence',
    content: 'Price making new highs while RSI makes lower highs indicates weakening momentum and potential reversal.',
    difficulty: 'intermediate'
  },
  {
    id: 23,
    category: 'technical',
    title: 'Moving Average Strategy',
    content: 'Use EMAs for faster signals, SMAs for smoother trends. Golden cross works better on higher timeframes.',
    difficulty: 'beginner'
  },
  {
    id: 24,
    category: 'technical',
    title: 'Fibonacci Levels',
    content: '38.2%, 50%, and 61.8% are key retracement levels in healthy trends. Use for entry and exit points.',
    difficulty: 'intermediate'
  },
  {
    id: 25,
    category: 'technical',
    title: 'Bollinger Band Squeeze',
    content: 'Periods of low volatility (squeeze) often precede high volatility moves. Watch for breakouts from squeezes.',
    difficulty: 'advanced'
  },

  // Fundamental Analysis (10 tips)
  {
    id: 26,
    category: 'fundamental',
    title: 'Cash Flow Analysis',
    content: 'Cash flow doesn\'t lie. Focus on operating cash flow and free cash flow rather than just earnings.',
    difficulty: 'intermediate'
  },
  {
    id: 27,
    category: 'fundamental',
    title: 'Balance Sheet Strength',
    content: 'Look for companies with strong balance sheets: low debt, high current ratio, positive working capital.',
    difficulty: 'intermediate'
  },
  {
    id: 28,
    category: 'fundamental',
    title: 'ROIC Matters',
    content: 'Return on Invested Capital shows how efficiently management uses capital. High ROIC indicates quality.',
    difficulty: 'advanced'
  },
  {
    id: 29,
    category: 'fundamental',
    title: 'Economic Moats',
    content: 'Invest in companies with durable competitive advantages: brand, patents, network effects, cost advantages.',
    author: 'Warren Buffett',
    difficulty: 'intermediate'
  },
  {
    id: 30,
    category: 'fundamental',
    title: 'Management Quality',
    content: 'Great management can make an average business good, while poor management can ruin a great business.',
    difficulty: 'intermediate'
  },

  // Advanced Trading (10 tips)
  {
    id: 31,
    category: 'trading',
    title: 'VWAP Strategy',
    content: 'Price above VWAP indicates bullish intraday bias, below indicates bearish bias. Institutions use this heavily.',
    difficulty: 'advanced'
  },
  {
    id: 32,
    category: 'trading',
    title: 'Market Profile',
    content: 'Understand value areas and price acceptance. Markets spend 70% of time in value areas.',
    difficulty: 'advanced'
  },
  {
    id: 33,
    category: 'trading',
    title: 'Order Flow Analysis',
    content: 'Watch for large block trades and absorption. Smart money leaves footprints in the tape.',
    difficulty: 'advanced'
  },
  {
    id: 34,
    category: 'trading',
    title: 'Seasonal Patterns',
    content: 'Markets exhibit seasonal tendencies. "Sell in May and go away" has historical statistical edge.',
    difficulty: 'intermediate'
  },
  {
    id: 35,
    category: 'trading',
    title: 'Sector Rotation',
    content: 'Money moves between sectors based on economic cycles. Identify which sectors are in favor.',
    difficulty: 'advanced'
  },

  // Market Psychology (10 tips)
  {
    id: 36,
    category: 'psychology',
    title: 'Fear & Greed Cycle',
    content: 'Markets swing between extremes of fear and greed. Be fearful when others are greedy, greedy when fearful.',
    author: 'Warren Buffett',
    difficulty: 'intermediate'
  },
  {
    id: 37,
    category: 'psychology',
    title: 'Confirmation Bias',
    content: 'We see what we want to see. Actively seek disconfirming evidence for your trade ideas.',
    difficulty: 'advanced'
  },
  {
    id: 38,
    category: 'psychology',
    title: 'Anchoring Effect',
    content: 'Don\'t anchor to your entry price. The market doesn\'t care what price you bought at.',
    difficulty: 'intermediate'
  },
  {
    id: 39,
    category: 'psychology',
    title: 'Overconfidence Trap',
    content: 'After a few wins, traders become overconfident. Stay humble - the market can humble anyone.',
    difficulty: 'intermediate'
  },
  {
    id: 40,
    category: 'psychology',
    title: 'Loss Aversion',
    content: 'We feel the pain of losses twice as much as the pleasure of gains. This leads to poor risk management.',
    difficulty: 'advanced'
  },

  // Risk Management Advanced (10 tips)
  {
    id: 41,
    category: 'risk',
    title: 'Correlation Risk',
    content: 'Understand how your positions correlate. High correlation increases portfolio risk dramatically.',
    difficulty: 'advanced'
  },
  {
    id: 42,
    category: 'risk',
    title: 'Leverage Management',
    content: 'Leverage amplifies both gains and losses. Use it sparingly and understand the risks completely.',
    difficulty: 'intermediate'
  },
  {
    id: 43,
    category: 'risk',
    title: 'Black Swan Protection',
    content: 'Always have a plan for unexpected events. Tail risk hedging can save your portfolio.',
    author: 'Nassim Taleb',
    difficulty: 'advanced'
  },
  {
    id: 44,
    category: 'risk',
    title: 'Drawdown Management',
    content: 'Maximum drawdown determines your survival. Never let losses exceed your psychological tolerance.',
    difficulty: 'intermediate'
  },
  {
    id: 45,
    category: 'risk',
    title: 'Portfolio Beta',
    content: 'Understand your portfolio\'s overall risk exposure. High beta portfolios need smaller position sizes.',
    difficulty: 'advanced'
  },

  // Trading Execution (5 tips)
  {
    id: 46,
    category: 'trading',
    title: 'Limit vs Market Orders',
    content: 'Use limit orders to control entry price, market orders for urgent entries. Know when to use each.',
    difficulty: 'beginner'
  },
  {
    id: 47,
    category: 'trading',
    title: 'Slippage Control',
    content: 'Trade liquid instruments during active hours to minimize slippage. It adds up significantly over time.',
    difficulty: 'intermediate'
  },
  {
    id: 48,
    category: 'trading',
    title: 'Trade Journal',
    content: 'Keep detailed records of every trade. Review weekly to identify patterns and improve your edge.',
    difficulty: 'beginner'
  },
  {
    id: 49,
    category: 'trading',
    title: 'Backtesting',
    content: 'Test strategies on historical data before risking capital. Past performance doesn\'t guarantee future results.',
    difficulty: 'intermediate'
  },
  {
    id: 50,
    category: 'trading',
    title: 'Continuous Learning',
    content: 'Markets evolve constantly. The learning never stops for successful traders.',
    difficulty: 'beginner'
  }
];