import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import users from '../data/users';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/; // at least 8 chars and one digit

const COLORS = { primary: '#D9480F', text: '#1F1A17', muted: '#6F655E', border: '#E7DBD0', danger: '#C92A2A', bg: '#FFF8F2', white: '#FFFFFF' };

export default function LoginScreen({ navigation }) {
  // UI mode
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Controlled inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Validation feedback + UI flags
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  // Returns an onChangeText handler that updates the field and clears its error immediately.
  const onEdit = (setter, field) => (value) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const e = {};
    if (isSignup && fullName.trim().length < 3) e.fullName = 'Please enter your full name (at least 3 letters).';
    if (!EMAIL_REGEX.test(email.trim())) e.email = 'Enter a valid email address, e.g. name@example.com.';
    if (!PASSWORD_REGEX.test(password)) e.password = 'Password must be at least 8 characters and contain a digit.';
    if (isSignup && confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setErrors({});
  };

  const goHome = (account) => {
    // Customer -> Menu, Manager -> Dashboard
    navigation.replace(account.role === 'manager' ? 'Dashboard' : 'Menu', { user: account });
  };

  const onSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);
    // Simulate a network request with a one second delay.
    setTimeout(() => {
      setIsSubmitting(false);
      const normalised = email.trim().toLowerCase();
      if (isSignup) {
        if (users.some((u) => u.email === normalised)) {
          Alert.alert('Signup failed', 'An account with this email already exists. Please log in instead.');
          return;
        }
        const newUser = { id: `u${Date.now()}`, fullName: fullName.trim(), email: normalised, password, role };
        users.push(newUser); // mock "database" for now
        goHome(newUser);
      } else {
        const account = users.find((u) => u.email === normalised && u.password === password);
        if (!account) {
          Alert.alert('Login failed', 'Incorrect email or password. Please try again.');
          return;
        }
        goHome(account);
      }
    }, 1000);
  };

  const renderField = ({ label, value, onChangeText, error, ...rest }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, error && { borderColor: COLORS.danger }]}
        placeholderTextColor={COLORS.muted}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.title}>Tasty Table</Text>

        <View style={styles.segment}>
          {['login', 'signup'].map((m) => (
            <Pressable key={m} onPress={() => m !== mode && switchMode()} style={[styles.segmentItem, mode === m && styles.segmentActive]}>
              <Text style={{ fontWeight: '700', color: mode === m ? COLORS.white : COLORS.text }}>{m === 'login' ? 'Login' : 'Sign up'}</Text>
            </Pressable>
          ))}
        </View>

        {isSignup && renderField({ label: 'Full name', value: fullName, onChangeText: onEdit(setFullName, 'fullName'), error: errors.fullName, placeholder: 'Ali Raza' })}
        {renderField({ label: 'Email', value: email, onChangeText: onEdit(setEmail, 'email'), error: errors.email, placeholder: 'you@example.com', keyboardType: 'email-address', autoCapitalize: 'none' })}
        {renderField({ label: 'Password', value: password, onChangeText: onEdit(setPassword, 'password'), error: errors.password, placeholder: 'At least 8 characters with a digit', secureTextEntry: !showPassword, autoCapitalize: 'none' })}
        <Pressable onPress={() => setShowPassword((s) => !s)}>
          <Text style={styles.link}>{showPassword ? 'Hide password' : 'Show password'}</Text>
        </Pressable>

        {isSignup && (
          <>
            {renderField({ label: 'Confirm password', value: confirmPassword, onChangeText: onEdit(setConfirmPassword, 'confirmPassword'), error: errors.confirmPassword, placeholder: 'Repeat your password', secureTextEntry: !showPassword, autoCapitalize: 'none' })}
            <Text style={styles.label}>I am a</Text>
            <View style={styles.roleRow}>
              {['customer', 'manager'].map((r) => (
                <Pressable key={r} onPress={() => setRole(r)} style={[styles.role, role === r && { borderColor: COLORS.primary }]}>
                  <Text style={{ fontWeight: '700', color: role === r ? COLORS.primary : COLORS.text }}>{r === 'customer' ? 'Customer' : 'Manager'}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Pressable onPress={onSubmit} disabled={isSubmitting} style={[styles.button, isSubmitting && { opacity: 0.6 }]}>
          {isSubmitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{isSignup ? 'Create account' : 'Login'}</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  logo: { fontSize: 56, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: COLORS.text, marginBottom: 24 },
  segment: { flexDirection: 'row', backgroundColor: '#F6EDE4', borderRadius: 12, padding: 4, marginBottom: 16 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.primary },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12, minHeight: 46, backgroundColor: COLORS.white, color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  link: { color: COLORS.primary, fontWeight: '600', marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  role: { flex: 1, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12 },
  button: { backgroundColor: COLORS.primary, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
