import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Shown while AsyncStorage data is loading so the app never flashes empty data.
export default function LoadingScreen({ message = 'Loading your restaurant…' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={styles.logo}>🍽️</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted, marginTop: 12 }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 56, marginBottom: 16 },
});
