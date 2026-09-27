import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { resetToLogin } from '../navigation/navigationRef';
import { AppButton, Card, Screen } from '../components/ui';
import { spacing } from '../theme/colors';

export default function ProfileScreen() {
  // No props: user and theme come from context (no prop drilling).
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const onLogout = () =>
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          // Reset the whole navigation stack first, then clear the user.
          resetToLogin();
          logout();
        },
      },
    ]);

  if (!user) return null;

  const initials = user.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryText }]}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{user.role === 'manager' ? '💼 Manager' : '🙂 Customer'}</Text>
          </View>
        </View>

        <Card>
          <InfoRow icon="person-outline" label="Full name" value={user.fullName} />
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
          <InfoRow icon="shield-checkmark-outline" label="Role" value={user.role === 'manager' ? 'Restaurant Manager' : 'Customer'} />
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.switchRow}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.accent} />
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>Dark mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </Card>

        <AppButton
          title="Log out"
          variant="danger"
          onPress={onLogout}
          style={{ marginTop: spacing.xl }}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.primaryText} />}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg, gap: 8 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900' },
  rolePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
