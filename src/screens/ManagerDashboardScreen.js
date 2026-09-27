import React from 'react';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { EmptyState, Screen } from '../components/ui';

// Placeholder: the full dashboard is built in Question 10.
export default function ManagerDashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  return (
    <Screen style={{ justifyContent: 'center' }}>
      <EmptyState emoji="👨‍🍳" title={`Welcome, ${user?.fullName ?? 'manager'}`}>
        <Text style={{ color: colors.textMuted }}>Orders, reservations and menu tools arrive in Question 10.</Text>
      </EmptyState>
    </Screen>
  );
}
