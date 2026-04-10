export const GBP_CURRENCY_CODE = 'GBP';
export const GBP_CURRENCY_LABEL = 'GBP (\u00A3)';
export const GBP_CURRENCY_SYMBOL = '\u00A3';

interface FormatPoundAmountOptions {
  fallback?: string;
  suffix?: string;
}

export const formatPoundAmount = (
  amount?: number | null,
  options: FormatPoundAmountOptions = {}
) => {
  const { fallback = 'N/A', suffix = '' } = options;

  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return fallback;
  }

  return `${GBP_CURRENCY_SYMBOL}${amount.toLocaleString()}${suffix}`;
};
