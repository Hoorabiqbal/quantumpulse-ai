/**
 * Calculates the Standard Deviation of an array of numbers.
 * @param values Array of numerical values (e.g., historical prices)
 * @returns The standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  
  return Math.sqrt(variance);
};

/**
 * Calculates the Volatility as a percentage of the average value.
 * Useful for comparing volatility across different assets.
 * @param prices Array of historical prices
 * @returns Volatility percentage (e.g., 2.5 means 2.5% volatility)
 */
export const calculateVolatilityPercentage = (prices: number[]): number => {
  if (!prices || prices.length === 0) return 0;
  
  const stdDev = calculateStandardDeviation(prices);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  if (mean === 0) return 0;
  
  return (stdDev / mean) * 100;
};
