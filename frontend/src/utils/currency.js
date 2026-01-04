// Currency formatting utilities
export const formatCurrency = (amount, currency = 'UZS', showSymbol = true) => {
  if (!amount && amount !== 0) return '0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  const formatted = new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(numAmount));
  
  if (!showSymbol) return formatted;
  
  const symbols = {
    'UZS': 'so\'m',
    'USD': '$',
    'EUR': '€',
    'RUB': '₽'
  };
  
  return `${formatted} ${symbols[currency] || ''}`;
};

export const formatCurrencyInput = (value) => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Add commas for thousands
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const parseCurrencyInput = (value) => {
  // Remove commas and convert to number
  return parseFloat(value.replace(/,/g, '')) || 0;
};

export const getCurrencyIcon = (currency = 'UZS') => {
  const icons = {
    'UZS': '₽', // Using ₽ as placeholder, can be replaced with actual UZS symbol
    'USD': '$',
    'EUR': '€',
    'RUB': '₽'
  };
  return icons[currency] || '₽';
};

export const formatCurrencyShort = (amount, currency = 'UZS') => {
  if (!amount && amount !== 0) return '0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  if (isNaN(numAmount)) return '0';
  
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M ${currency === 'UZS' ? 'so\'m' : ''}`;
  }
  if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(0)}k ${currency === 'UZS' ? 'so\'m' : ''}`;
  }
  
  return formatCurrency(numAmount, currency);
};

