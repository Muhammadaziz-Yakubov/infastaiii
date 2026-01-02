import * as Sentry from '@sentry/react';

// Sentry initialization
// Note: Add your DSN in .env file as VITE_SENTRY_DSN
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }
};

