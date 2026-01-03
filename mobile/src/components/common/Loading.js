import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const Loading = ({ text = "Yuklanmoqda...", fullScreen = true }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      {text && <Text style={styles.inlineText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: SIZES.base,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inlineText: {
    marginLeft: 10,
    fontSize: SIZES.md,
    color: COLORS.gray600,
  },
});

export default Loading;
