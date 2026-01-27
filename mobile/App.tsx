import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { NotificationProvider } from '@/services/NotificationService';
import { store, persistor } from '@/store/store';
import AppNavigator from '@/navigation/AppNavigator';

// Must be exported or Fast Refresh won't update the context
export function AppEntry() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <PaperProvider>
            <SafeAreaProvider>
              <NotificationProvider>
                <AppNavigator />
                <StatusBar style="auto" />
              </NotificationProvider>
            </SafeAreaProvider>
          </PaperProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

// Default export for the app
const App = AppEntry;

registerRootComponent(App);
