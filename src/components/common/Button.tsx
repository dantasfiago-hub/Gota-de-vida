import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'soft' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  small?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, small, style, accessibilityHint }: Props) {
  const isDisabled = disabled || loading;
  const textColor =
    variant === 'primary' || variant === 'danger' ? colors.white : variant === 'ghost' ? colors.textMuted : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        styles[variant],
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.text, small && { fontSize: 14 }, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 50, borderRadius: radius.pill, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  small: { minHeight: 40, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 16, fontWeight: '600' },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.primaryDark },
  outline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  soft: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: 'transparent' },
});
