import React, { useState } from 'react';
import { KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius } from '@/theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  editable?: boolean;
  hint?: string;
}

export function Input({ label, value, onChangeText, error, placeholder, secure, keyboardType, autoCapitalize = 'none', maxLength, multiline, editable = true, hint }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.focus, !!error && styles.err, !editable && { backgroundColor: colors.gray }]}>
        <TextInput
          style={[styles.input, multiline && { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          multiline={multiline}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            {hidden ? <Eye size={20} color={colors.textMuted} /> : <EyeOff size={20} color={colors.textMuted} />}
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  box: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14 },
  focus: { borderColor: colors.primary },
  err: { borderColor: colors.primaryDark, backgroundColor: '#FFF7F7' },
  input: { flex: 1, minHeight: 50, fontSize: 16, color: colors.text },
  error: { color: colors.primaryDark, fontSize: 13, marginTop: 4 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
