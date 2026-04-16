import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/theme/colors';
import { ApiError } from '../../src/types/api';

export default function RegisterScreen() {
  const { register, clearError } = useAuthStore();
  const router = useRouter();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())    errs.name    = 'Full name is required';
    if (!email.trim())   errs.email   = 'Email is required';
    if (!password)       errs.password = 'Password is required';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    setGlobalError('');
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        name:                  name.trim(),
        email:                 email.trim().toLowerCase(),
        password,
        password_confirmation: confirm,
      });
      // Auth gate will auto-redirect to (tabs)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, msgs] of Object.entries(err.errors)) {
          mapped[field] = msgs[0];
        }
        setFieldErrors(mapped);
      } else {
        setGlobalError(
          err instanceof Error ? err.message : 'Registration failed. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[COLORS.primary + '20', 'transparent']}
            style={styles.heroGradient}
          />

          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="person-add-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join TradeView for free</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {!!globalError && (
              <View style={styles.globalError}>
                <Ionicons name="alert-circle" size={14} color={COLORS.bear} />
                <Text style={styles.globalErrorText}>{globalError}</Text>
              </View>
            )}

            {/* Name */}
            <FieldInput
              label="Full Name"
              icon="person-outline"
              placeholder="John Doe"
              value={name}
              onChangeText={(t) => { setName(t); setFieldErrors((e) => ({ ...e, name: '' })); }}
              error={fieldErrors.name}
              autoCapitalize="words"
            />

            {/* Email */}
            <FieldInput
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); }}
              error={fieldErrors.email}
              keyboardType="email-address"
            />

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, !!fieldErrors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: '' })); }}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {!!fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}
            </View>

            {/* Confirm */}
            <FieldInput
              label="Confirm Password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter password"
              value={confirm}
              onChangeText={(t) => { setConfirm(t); setFieldErrors((e) => ({ ...e, confirm: '' })); }}
              error={fieldErrors.confirm}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {/* Terms note */}
            <Text style={styles.termsNote}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </Text>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <>
                  <Text style={styles.submitText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.text} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── FieldInput helper ────────────────────────────────────────────────────────
import type { ComponentProps } from 'react';
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface FieldInputProps {
  label:            string;
  icon:             IoniconsName;
  placeholder:      string;
  value:            string;
  onChangeText:     (t: string) => void;
  error?:           string;
  keyboardType?:    'default' | 'email-address' | 'numeric';
  autoCapitalize?:  'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  returnKeyType?:   'next' | 'done';
  onSubmitEditing?: () => void;
}

function FieldInput({
  label, icon, placeholder, value, onChangeText, error,
  keyboardType = 'default', autoCapitalize = 'none', secureTextEntry = false,
  returnKeyType = 'next', onSubmitEditing,
}: FieldInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, !!error && styles.inputError]}>
        <Ionicons name={icon} size={16} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: 24,
    paddingTop:        16,
    paddingBottom:     40,
  },
  heroGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 250,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginBottom:  24,
  },
  backText: {
    fontSize: 14,
    color:    COLORS.textSecondary,
  },
  header: {
    alignItems:   'center',
    marginBottom: 28,
  },
  logoIcon: {
    width:           60,
    height:          60,
    borderRadius:    16,
    backgroundColor: COLORS.card,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  title: {
    fontSize:   24,
    fontWeight: '700',
    color:      COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color:    COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    20,
    padding:         24,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  globalError: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   'rgba(239,68,68,0.1)',
    borderRadius:      10,
    paddingVertical:    10,
    paddingHorizontal: 14,
    marginBottom:      16,
    borderWidth:       1,
    borderColor:       COLORS.bear + '40',
  },
  globalErrorText: { fontSize: 13, color: COLORS.bear, flex: 1 },
  fieldGroup:      { marginBottom: 14 },
  label: {
    fontSize:      12,
    fontWeight:    '600',
    color:         COLORS.textSecondary,
    marginBottom:   6,
    letterSpacing:  0.3,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.cardElevated,
    borderRadius:      12,
    borderWidth:       1,
    borderColor:       COLORS.border,
    paddingHorizontal: 14,
    height:            50,
  },
  inputError: { borderColor: COLORS.bear + '80' },
  inputIcon:  { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: 4 },
  fieldError: { fontSize: 12, color: COLORS.bear, marginTop: 5, marginLeft: 2 },
  termsNote: {
    fontSize:    12,
    color:       COLORS.textMuted,
    textAlign:   'center',
    lineHeight:  18,
    marginBottom: 16,
    marginTop:    4,
  },
  submitBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    backgroundColor: COLORS.primary,
    borderRadius:    14,
    height:          52,
    marginBottom:    20,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  footer: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },
  footerText: { fontSize: 14, color: COLORS.textMuted },
  footerLink: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600' },
});
