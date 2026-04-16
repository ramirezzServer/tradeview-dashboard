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
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/theme/colors';
import { ApiError } from '../../src/types/api';

export default function LoginScreen() {
  const { login, isLoading: authLoading, clearError } = useAuthStore();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim())    errs.email    = 'Email is required';
    if (!password.trim()) errs.password = 'Password is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    setGlobalError('');
    clearError();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Auth gate in _layout.tsx will auto-redirect to (tabs)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, msgs] of Object.entries(err.errors)) {
          mapped[field] = msgs[0];
        }
        setFieldErrors(mapped);
      } else {
        setGlobalError(
          err instanceof Error ? err.message : 'Login failed. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || authLoading;

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
          {/* Hero gradient */}
          <LinearGradient
            colors={[COLORS.primary + '25', 'transparent']}
            style={styles.heroGradient}
          />

          {/* Logo / Brand */}
          <View style={styles.brand}>
            <View style={styles.logoIcon}>
              <Ionicons name="trending-up" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.logoText}>TradeView</Text>
            <Text style={styles.logoSub}>Professional Trading Dashboard</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSub}>Access your trading dashboard</Text>

            {/* Global error */}
            {!!globalError && (
              <View style={styles.globalError}>
                <Ionicons name="alert-circle" size={14} color={COLORS.bear} />
                <Text style={styles.globalErrorText}>{globalError}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, !!fieldErrors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: '' })); }}
                />
              </View>
              {!!fieldErrors.email && (
                <Text style={styles.fieldError}>{fieldErrors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, !!fieldErrors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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
              {!!fieldErrors.password && (
                <Text style={styles.fieldError}>{fieldErrors.password}</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <>
                  <Text style={styles.submitText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.text} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Create one</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Bottom disclaimer */}
          <Text style={styles.disclaimer}>
            Market data powered by Finnhub &amp; Alpha Vantage
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     40,
  },
  heroGradient: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   300,
  },
  // ── Brand ──
  brand: {
    alignItems:  'center',
    marginTop:    40,
    marginBottom: 36,
  },
  logoIcon: {
    width:           64,
    height:          64,
    borderRadius:    18,
    backgroundColor: COLORS.card,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    14,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  logoText: {
    fontSize:     28,
    fontWeight:   '700',
    color:        COLORS.text,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize:  13,
    color:     COLORS.textMuted,
    marginTop:  4,
  },
  // ── Card ──
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    20,
    padding:         24,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  cardTitle: {
    fontSize:     22,
    fontWeight:   '700',
    color:        COLORS.text,
    marginBottom:  4,
  },
  cardSub: {
    fontSize:     13,
    color:        COLORS.textMuted,
    marginBottom: 24,
  },
  // ── Global error ──
  globalError: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius:    10,
    paddingVertical:  10,
    paddingHorizontal: 14,
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     COLORS.bear + '40',
  },
  globalErrorText: {
    fontSize: 13,
    color:    COLORS.bear,
    flex:     1,
  },
  // ── Field ──
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize:     12,
    fontWeight:   '600',
    color:        COLORS.textSecondary,
    marginBottom:  6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.cardElevated,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: 14,
    height:          50,
  },
  inputError: {
    borderColor: COLORS.bear + '80',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex:      1,
    fontSize:  15,
    color:     COLORS.text,
  },
  eyeBtn: {
    padding: 4,
  },
  fieldError: {
    fontSize:  12,
    color:     COLORS.bear,
    marginTop:  5,
    marginLeft:  2,
  },
  // ── Submit ──
  submitBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    backgroundColor: COLORS.primary,
    borderRadius:    14,
    height:          52,
    marginTop:        8,
    marginBottom:    20,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize:   16,
    fontWeight: '600',
    color:      COLORS.text,
  },
  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:    'center',
  },
  footerText: {
    fontSize: 14,
    color:    COLORS.textMuted,
  },
  footerLink: {
    fontSize:   14,
    color:      COLORS.primaryLight,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign:  'center',
    fontSize:   11,
    color:      COLORS.textDim,
    marginTop:  24,
  },
});
