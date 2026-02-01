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

      if (!consentData) {
        // First time user - show consent
        setShowConsentModal(true);
      } else {
        // Already consented sometime in the past
        setConsentGiven(true);
      }
    };

    checkConsentStatus();
  }, []);

  const handleConsent = (accepted) => {
    try {
      const consentData = {
        date: new Date().toISOString(),
        accepted: accepted
      };

      localStorage.setItem('privacyConsent', JSON.stringify(consentData));
      setConsentGiven(true);
      setShowConsentModal(false);
    } catch (error) {
      console.error('Error saving consent data:', error);
    }
  };

  return (
    <PrivacyConsentContext.Provider value={{ consentGiven, showConsentModal, handleConsent }}>
      {children}
    </PrivacyConsentContext.Provider>
  );
};
