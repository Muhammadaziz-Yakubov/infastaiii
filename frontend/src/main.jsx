import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/styles/globals.css'

import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SearchProvider } from './contexts/SearchContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { initSentry } from './lib/sentry'
import './lib/i18n' // Initialize i18next
import i18n from './lib/i18n'
import { useAppStore } from './stores/useAppStore'

// Sync language from store to i18next on init
const savedLanguage = localStorage.getItem('i18nextLng') || useAppStore.getState().language || 'uz';
if (savedLanguage && savedLanguage !== i18n.language) {
  i18n.changeLanguage(savedLanguage);
  useAppStore.getState().setLanguage(savedLanguage);
}

// Initialize Sentry
initSentry()

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider>
            <AuthProvider>
              <SearchProvider>
                <App />
              </SearchProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      ) : (
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
      )}
    </QueryClientProvider>
  </React.StrictMode>
)
