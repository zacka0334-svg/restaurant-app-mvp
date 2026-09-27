import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { login, findUser, emailExists, signup } = useAuth();

  // UI mode, password visibility and submitting flag stay as local useState.
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form values and errors (local state for now).
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});

  // Editing a field clears that field's error immediately.
  const handleChange = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
  };

  const handleSubmit = (onValid) => {
    const nextErrors = validateAuth(values, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onValid(values);
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
  };

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

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🍽️</Text>
          <Text style={[styles.title, { color: colors.text }]}>Tasty Table</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl }}>
            Browse the menu, book a table and order ahead.
          </Text>

          {/* Mode switch */}
          <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
            {['login', 'signup'].map((m) => (
              <Pressable
                key={m}
                onPress={() => m !== mode && switchMode()}
                style={[styles.segmentItem, mode === m && { backgroundColor: colors.primary }]}
              >
                <Text style={{ fontWeight: '700', color: mode === m ? colors.primaryText : colors.text }}>
                  {m === 'login' ? 'Login' : 'Sign up'}
                </Text>
              </Pressable>
            ))}
          </View>

          {isSignup ? (
            <Field
              label="Full name"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              error={errors.fullName}
              placeholder="Ali Raza"
              autoCapitalize="words"
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
          />

          <Field
            label="Password"
            value={values.password}
            onChangeText={handleChange('password')}
            error={errors.password}
            placeholder="At least 8 characters with a digit"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
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
              />

              <Text style={[styles.label, { color: colors.textMuted }]}>I am a</Text>
              <View style={styles.roleRow}>
                {[
                  { key: 'customer', label: 'Customer', icon: 'person-outline' },
                  { key: 'manager', label: 'Manager', icon: 'briefcase-outline' },
                ].map((r) => {
                  const selected = values.role === r.key;
                  return (
                    <Pressable
                      key={r.key}
                      onPress={() => handleChange('role')(r.key)}
                      style={[
                        styles.roleOption,
                        { borderColor: selected ? colors.primary : colors.border, backgroundColor: colors.surface },
                      ]}
                    >
                      <Ionicons name={r.icon} size={18} color={selected ? colors.primary : colors.textMuted} />
                      <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '700' }}>{r.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <AppButton
            title={isSignup ? 'Create account' : 'Login'}
            onPress={() => handleSubmit(onValid)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: spacing.md }}
          />

          <Pressable onPress={switchMode} style={{ marginTop: spacing.lg }}>
            <Text style={{ color: colors.primary, textAlign: 'center', fontWeight: '600' }}>
              {isSignup ? 'Already have an account? Login' : "New here? Create an account"}
            </Text>
          </Pressable>

          <View style={[styles.hint, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Demo customer: customer@restaurant.pk / Customer123{'\n'}Demo manager: manager@restaurant.pk / Manager123
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, flexGrow: 1, justifyContent: 'center', maxWidth: 480, width: '100%', alignSelf: 'center' },
  logo: { fontSize: 56, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  segment: { flexDirection: 'row', borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  roleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 12 },
  hint: { marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md },
});
