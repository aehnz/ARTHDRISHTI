export const formatINR = (amount: number, compact = false) => {
  if (compact && Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (compact && Math.abs(amount) >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

export const pct = (value: number) => Math.round(value * 10) / 10;
