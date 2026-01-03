import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import Button from './Button';

const EmptyState = ({ 
  icon = 'document-text-outline',
  title = "Ma'lumot topilmadi",
  description = "Hozircha hech narsa yo'q",
  buttonTitle,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonTitle && onButtonPress && (
        <Button 
          title={buttonTitle} 
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
  },
});

export default EmptyState;
