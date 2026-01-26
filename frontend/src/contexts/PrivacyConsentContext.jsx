import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyConsentContext = createContext();

export const usePrivacyConsent = () => {
  const context = useContext(PrivacyConsentContext);
  if (!context) {
    throw new Error('usePrivacyConsent must be used within a PrivacyConsentProvider');
  }
  return context;
};

export const PrivacyConsentProvider = ({ children }) => {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Check consent status on mount
  useEffect(() => {
    const checkConsentStatus = () => {
      const consentData = localStorage.getItem('privacyConsent');
      const today = new Date().toDateString();
      
      if (!consentData) {
        // First time user - show consent
        setShowConsentModal(true);
        return;
      }

      try {
        const parsed = JSON.parse(consentData);
        const lastConsentDate = new Date(parsed.date).toDateString();
        const dailyConsentCount = parsed.dailyCount || 0;
        const consentHistory = parsed.history || [];
        
        // Reset count if it's a new day
        if (lastConsentDate !== today) {
          const newConsentData = {
            date: new Date().toISOString(),
            dailyCount: 0,
            history: [...consentHistory, { date: lastConsentDate, count: dailyConsentCount }]
          };
          localStorage.setItem('privacyConsent', JSON.stringify(newConsentData));
        }
        
        // Check if we need to show consent (max 3 times per day)
        if (dailyConsentCount < 3) {
          setShowConsentModal(true);
        }
        
        setConsentGiven(dailyConsentCount > 0);
      } catch (error) {
        console.error('Error parsing consent data:', error);
        setShowConsentModal(true);
      }
    };

    checkConsentStatus();
  }, []);

  const handleConsent = (accepted) => {
    const consentData = localStorage.getItem('privacyConsent');
    const today = new Date().toDateString();
    
    try {
      let parsed = consentData ? JSON.parse(consentData) : {};
      const lastConsentDate = new Date(parsed.date || new Date()).toDateString();
      
      // Reset count if it's a new day
      if (lastConsentDate !== today) {
        parsed.dailyCount = 0;
        parsed.history = parsed.history || [];
        if (parsed.dailyCount > 0) {
          parsed.history.push({ date: lastConsentDate, count: parsed.dailyCount });
        }
      }
      
      // Update consent data
      parsed.date = new Date().toISOString();
      parsed.dailyCount = (parsed.dailyCount || 0) + 1;
      parsed.lastAccepted = accepted;
      parsed.history = parsed.history || [];
      
      localStorage.setItem('privacyConsent', JSON.stringify(parsed));
      setConsentGiven(true);
      setShowConsentModal(false);
    } catch (error) {
      console.error('Error saving consent data:', error);
      // Fallback - just set a simple flag
      localStorage.setItem('privacyConsent', JSON.stringify({
        date: new Date().toISOString(),
        dailyCount: 1,
        lastAccepted: accepted
      }));
      setConsentGiven(true);
      setShowConsentModal(false);
    }
  };

  return (
    <PrivacyConsentContext.Provider value={{ consentGiven, showConsentModal, handleConsent }}>
      {children}
    </PrivacyConsentContext.Provider>
  );
};
