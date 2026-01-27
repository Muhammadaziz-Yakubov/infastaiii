import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Dashboard
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Welcome to InFast AI
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});

export default DashboardScreen;
