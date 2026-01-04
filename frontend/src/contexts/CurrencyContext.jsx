// context/CurrencyContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('UZS');
  const [rates, setRates] = useState({
    USD: 12022.47,
    RUB: 148.98
  });

  const formatCurrency = (amount) => {
    if (currency === 'UZS') {
      return new Intl.NumberFormat('uz-UZ').format(amount) + ' soʻm';
    } else if (currency === 'USD') {
      const usdAmount = amount / rates.USD;
      return '$' + usdAmount.toFixed(2);
    } else if (currency === 'RUB') {
      const rubAmount = amount / rates.RUB;
      return rubAmount.toFixed(2) + ' руб';
    }
    return amount;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      rates, 
      setRates, 
      formatCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);