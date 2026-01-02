import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput, formatCurrency } from '../utils/currency';

const CurrencyInput = ({ 
  value, 
  onChange, 
  currency = 'UZS', 
  placeholder = '0',
  className = '',
  disabled = false,
  label = '',
  error = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value || value === 0) {
      setDisplayValue(formatCurrencyInput(value.toString()));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const formatted = formatCurrencyInput(inputValue);
    setDisplayValue(formatted);
    
    const numericValue = parseCurrencyInput(formatted);
    onChange(numericValue);
  };

  const currencySymbol = currency === 'UZS' ? 'so\'m' : currency === 'USD' ? '$' : currency;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-20 py-3 bg-gray-50 dark:bg-gray-800 border ${
            error 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-gray-200 dark:border-gray-700'
          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          } ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {currencySymbol}
          </span>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {value > 0 && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatCurrency(value, currency)}
        </p>
      )}
    </div>
  );
};

export default CurrencyInput;

