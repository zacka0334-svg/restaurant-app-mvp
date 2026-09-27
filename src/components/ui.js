// Small reusable, theme-aware UI building blocks shared by every screen.
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';

// Screen container. Stack headers already handle the top inset and the tab bar
// handles the bottom, so by default only the side edges are padded.
export function Screen({ children, edges = ['left', 'right'], style }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function AppButton({ title, onPress, variant = 'primary', disabled, loading, style, small, icon }) {
  const { colors } = useTheme();
  const bg =
    variant === 'primary' ? colors.primary
      : variant === 'danger' ? colors.danger
        : variant === 'success' ? colors.success
          : 'transparent';
  const fg = variant === 'outline' ? colors.primary : colors.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading) }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: disabled ? colors.disabled : bg, borderColor: variant === 'outline' ? colors.primary : 'transparent' },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.buttonText, small && { fontSize: 13 }, { color: disabled ? colors.surface : fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, inputRef, right, ...inputProps }) {
  const { colors } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}
      <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
        <TextInput
          ref={inputRef}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          {...inputProps}
        />
        {right}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, disabled, style }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.primary : colors.chip, opacity: disabled ? 0.45 : 1 },
        style,
      ]}
    >
      <Text
        style={{
          color: selected ? colors.primaryText : disabled ? colors.textMuted : colors.text,
          fontWeight: '600',
          textDecorationLine: disabled ? 'line-through' : 'none',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function EmptyState({ emoji = '🍽️', title, message, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{message}</Text> : null}
      {children}
    </View>
  );
}

export function SectionTitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[styles.section, { color: colors.text }, style]}>{children}</Text>;
}

export function Badge({ label, color }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: color || colors.accent }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  button: { minHeight: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, borderWidth: 1.5 },
  buttonSmall: { minHeight: 34, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  buttonText: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md },
  input: { flex: 1, minHeight: 46, fontSize: 15 },
  error: { fontSize: 12, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, marginRight: spacing.sm },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
  empty: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { color: '#1A0E07', fontSize: 11, fontWeight: '800' },
});
