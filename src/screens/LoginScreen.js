import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useForm from '../hooks/useForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, Field, Screen } from '../components/ui';
import { radius, spacing } from '../theme/colors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/; // at least 8 chars and one digit

// Defined outside the component so the reference never changes.
const INITIAL_VALUES = { fullName: '', email: '', password: '', confirmPassword: '', role: 'customer' };

// Validation depends on the mode, so we build one validator per mode.
export function validateAuth(values, mode) {
  const errors = {};
  if (mode === 'signup' && values.fullName.trim().length < 3) {
    errors.fullName = 'Please enter your full name (at least 3 letters).';
  }
  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address, e.g. name@example.com.';
  }
  if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = 'Password must be at least 8 characters and contain a digit.';
  }
  if (mode === 'signup' && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}
const validateLogin = (v) => validateAuth(v, 'login');
const validateSignup = (v) => validateAuth(v, 'signup');

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, findUser, emailExists, signup } = useAuth();

  // UI mode, password visibility and submitting flag stay as local useState.
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Q9: form values + errors now come from the reusable useForm hook.
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    INITIAL_VALUES,
    mode === 'login' ? validateLogin : validateSignup
  );

  const isSignup = mode === 'signup';

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    reset();
  };

  const goHome = useCallback(
    (account) => {
      login(account); // store the user in AuthContext (Q6)
      // Customer -> Menu, Manager -> Dashboard. reset() so Back cannot return to Login.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: account.role === 'manager' ? 'DashboardTab' : 'MenuTab' } }],
      });
    },
    [login, navigation]
  );

  const onValid = (formValues) => {
    setIsSubmitting(true);
    // Simulated network delay of one second.
    setTimeout(() => {
      setIsSubmitting(false);
      if (isSignup) {
        if (emailExists(formValues.email)) {
          Alert.alert('Signup failed', 'An account with this email already exists. Please log in instead.');
          return;
        }
        const created = signup(formValues);
        goHome(created);
      } else {
        const account = findUser(formValues.email, formValues.password);
        if (!account) {
          Alert.alert('Login failed', 'Incorrect email or password. Please try again.');
          return;
        }
        goHome(account);
      }
    }, 1000);
  };

  const eye = (
    <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10} accessibilityLabel="Toggle password visibility">
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
    </Pressable>
  );

  const fillDemo = (email, password) => {
    handleChange('email')(email);
    handleChange('password')(password);
  };

  const icon = (name) => <Ionicons name={name} size={18} color={colors.textMuted} style={{ marginRight: 8 }} />;

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Brand header */}
          <View style={[styles.hero, { backgroundColor: colors.hero, paddingTop: insets.top + spacing.xl }]}>
            <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.logo}>🍛</Text>
            </View>
            <Text style={[styles.brand, { color: colors.heroText }]}>Dastarkhwan</Text>
            <Text style={[styles.tagline, { color: colors.heroText }]}>Order ahead · Book a table · Skip the queue</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Mode switch: underline tabs */}
            <View style={[styles.tabs, { borderColor: colors.border }]}>
              {['login', 'signup'].map((m) => {
                const active = mode === m;
                return (
                  <Pressable key={m} onPress={() => !active && switchMode()} style={styles.tab}>
                    <Text style={{ fontWeight: '800', fontSize: 15, color: active ? colors.primary : colors.textMuted }}>
                      {m === 'login' ? 'Sign in' : 'Create account'}
                    </Text>
                    <View style={[styles.tabLine, { backgroundColor: active ? colors.primary : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.welcome, { color: colors.text }]}>
              {isSignup ? 'Join us for your next meal' : 'Welcome back!'}
            </Text>

            {isSignup ? (
              <Field
                label="Full name"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                error={errors.fullName}
                placeholder="Ahmed Ali"
                autoCapitalize="words"
                left={icon('person-outline')}
              />
            ) : null}

            <Field
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              error={errors.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={icon('mail-outline')}
            />

            <Field
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              error={errors.password}
              placeholder="At least 8 characters with a digit"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={icon('lock-closed-outline')}
              right={eye}
            />

            {isSignup ? (
              <>
                <Field
                  label="Confirm password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  error={errors.confirmPassword}
                  placeholder="Repeat your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  left={icon('shield-checkmark-outline')}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>Sign up as</Text>
                <View style={styles.roleRow}>
                  {[
                    { key: 'customer', label: 'Diner', sub: 'Order & reserve', emoji: '🙋' },
                    { key: 'manager', label: 'Manager', sub: 'Run the kitchen', emoji: '👨‍🍳' },
                  ].map((r) => {
                    const selected = values.role === r.key;
                    return (
                      <Pressable
                        key={r.key}
                        onPress={() => handleChange('role')(r.key)}
                        style={[
                          styles.roleOption,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 24 }}>{r.emoji}</Text>
                        <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '800' }}>{r.label}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{r.sub}</Text>
                        {selected ? (
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.roleCheck} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <AppButton
              title={isSignup ? 'Create my account' : 'Sign in'}
              onPress={() => handleSubmit(onValid)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={{ marginTop: spacing.sm, borderRadius: radius.pill }}
              icon={<Ionicons name={isSignup ? 'person-add-outline' : 'arrow-forward-circle-outline'} size={20} color={colors.primaryText} />}
            />
          </View>

          {/* Demo accounts: tap to fill the form */}
          {!isSignup ? (
            <View style={styles.demo}>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>Quick demo accounts (tap to fill)</Text>
              <View style={styles.demoRow}>
                <Pressable
                  onPress={() => fillDemo('customer@dastarkhwan.pk', 'Customer123')}
                  style={[styles.demoChip, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>🙋 Diner</Text>
                </Pressable>
                <Pressable
                  onPress={() => fillDemo('manager@dastarkhwan.pk', 'Manager123')}
                  style={[styles.demoChip, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>👨‍🍳 Manager</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingBottom: 56, paddingHorizontal: spacing.xl, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  logoCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logo: { fontSize: 40 },
  brand: { fontSize: 30, fontWeight: '900', letterSpacing: 0.5 },
  tagline: { fontSize: 13, opacity: 0.85, marginTop: 4, textAlign: 'center' },
  card: {
    marginTop: -36, marginHorizontal: spacing.lg, padding: spacing.xl, borderRadius: 24, borderWidth: 1,
    maxWidth: 480, width: '92%', alignSelf: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: spacing.lg },
  tab: { flex: 1, alignItems: 'center', paddingTop: 4 },
  tabLine: { height: 3, width: '60%', borderRadius: 2, marginTop: 10 },
  welcome: { fontSize: 20, fontWeight: '900', marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  roleOption: { flex: 1, alignItems: 'center', gap: 2, borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: 14 },
  roleCheck: { position: 'absolute', top: 8, right: 8 },
  demo: { marginTop: spacing.xl, marginBottom: spacing.xl, alignItems: 'center' },
  demoRow: { flexDirection: 'row', gap: spacing.md },
  demoChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
});
