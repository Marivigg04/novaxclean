/**
 * Formats a given amount in USD to either USD or VES based on the user's preference.
 * 
 * @param {number} amountInUsd The base price in USD
 * @param {number} exchangeRate The current USD to VES exchange rate
 * @param {string} currencyPref 'USD' or 'VES'
 * @returns {string} Formatted string, e.g. "$24.99" or "Bs. 912,14"
 */
export const formatCurrency = (amountInUsd, exchangeRate, currencyPref = 'USD') => {
  if (typeof amountInUsd !== 'number') {
    amountInUsd = parseFloat(amountInUsd?.toString().replace(/[^0-9.-]+/g, '')) || 0;
  }

  if (currencyPref === 'VES') {
    const amountInVes = amountInUsd * exchangeRate;
    const formattedNum = new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInVes);
    return `Bs. ${formattedNum}`;
  }

  // Default to USD
  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInUsd);
  return `$${formattedNum}`;
};
