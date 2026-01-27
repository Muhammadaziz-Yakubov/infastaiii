import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

const SplashScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        InFast AI
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
        Productivity & Life Manager
      </Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  loader: {
    marginTop: 24,
  },
});

export default SplashScreen;
