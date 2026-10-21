import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { MockWidget, MockRow } from '@/components/marketing/MockWidget';
import { roleHome, useAuth } from '@/lib/auth';
import { brand, colors, fonts, radii, shadows } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const roleTabs = ['Staff / Admin', 'Teacher', 'Parent', 'Student'] as const;

const demoLogins: { label: string; email: string; password: string }[] = [
  { label: 'Super Admin', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'School Principal', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'Admissions', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'Finance ERP', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'Teacher', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'Parent', email: 'admin@emschool.local', password: 'admin123456' },
  { label: 'Student', email: 'admin@emschool.local', password: 'admin123456' },
];

export default function SignInPage() {
  const { login } = useAuth();
  const { isDesktop } = useBreakpoint();
  const [roleTab, setRoleTab] = useState<(typeof roleTabs)[number]>('Staff / Admin');
  const [tenantSlug, setTenantSlug] = useState('demo-school');
  const [identifier, setIdentifier] = useState('admin@emschool.local');
  const [password, setPassword] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [demoOpen, setDemoOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmail = useMemo(() => identifier.includes('@'), [identifier]);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(identifier.trim(), password);
      router.replace(roleHome(user.role) as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.push('/(public)' as never)}>
        <Text style={styles.back}>← Back to website</Text>
      </Pressable>

      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <View>
          <Text style={styles.brandName}>{brand.wordmark}</Text>
          <Text style={styles.brandSub}>Sign in to your institution portal</Text>
        </View>
      </View>

      <Input
        label="Institution Code or Subdomain"
        value={tenantSlug}
        onChangeText={setTenantSlug}
        placeholder="e.g., al-amal-schools"
      />

      <View style={styles.roleTabs}>
        {roleTabs.map((t) => (
          <Pressable
            key={t}
            onPress={() => setRoleTab(t)}
            style={[styles.roleTab, roleTab === t && styles.roleTabActive]}
          >
            <Text style={[styles.roleTabText, roleTab === t && styles.roleTabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Email address, Student Code, or Registered Phone"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="name@school.edu.eg or STU-2026-001"
        autoCapitalize="none"
        icon="UserCheck"
      />

      <View>
        <View style={styles.pwLabelRow}>
          <Text style={styles.pwLabel}>Password</Text>
          <Pressable>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          icon="Lock"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.showPw}>
          <Text style={styles.forgot}>{showPassword ? 'Hide password' : 'Show password'}</Text>
        </Pressable>
      </View>

      <View style={styles.rememberRow}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
        />
        <Text style={styles.rememberText}>Keep me signed in on this device for 30 days</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={loading ? 'Signing in…' : 'Sign in to Portal →'}
        fullWidth
        size="lg"
        onPress={() => void onSubmit()}
        disabled={loading}
      />

      <Pressable onPress={() => setDemoOpen((v) => !v)} style={styles.demoToggle}>
        <Text style={styles.demoToggleText}>
          ⚡ Instant Demo Role Switcher {demoOpen ? '▾' : '▸'}
        </Text>
      </Pressable>
      {demoOpen ? (
        <View style={styles.demoBox}>
          <View style={styles.demoPills}>
            {demoLogins.map((d) => (
              <Pressable
                key={d.label}
                style={styles.demoPill}
                onPress={() => {
                  setIdentifier(d.email);
                  setPassword(d.password);
                }}
              >
                <Text style={styles.demoPillText}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/(public)/admissions-apply')}>
        <Text style={styles.help}>Need an admission application? Apply Online →</Text>
      </Pressable>
      <Text style={styles.secure}>
        Protected by strict multi-tenant branch isolation & enterprise encryption.
      </Text>
    </ScrollView>
  );

  if (!isDesktop) {
    return <View style={styles.mobileRoot}>{form}</View>;
  }

  return (
    <View style={styles.desktopRoot}>
      <View style={styles.left}>{form}</View>
      <View style={styles.right}>
        <View style={styles.glow} />
        <PillBadge label="✦ Universal Multi-Tenant K-12 SIS · LMS · ERP" tone="dark" />
        <Text style={styles.rightH}>One operating system from KG admission to graduation.</Text>

        <View style={styles.floatStack}>
          <MockWidget
            dark
            title="Multi-Branch Executive · Morning Sync"
            kpis={[
              { value: '96.4%', label: 'Attendance' },
              { value: '87.2%', label: 'Fees' },
              { value: '4', label: 'Stages' },
            ]}
            footer="Synced via ZKTeco & Mobile App · Auto-reconciled payments"
          >
            <MockRow
              dark
              title="Term 2 collection"
              subtitle="Sibling discounts applied"
              right={<PillBadge label="Live" tone="emerald" />}
            />
          </MockWidget>

          <View style={[styles.floatCard, shadows.card]}>
            <Text style={styles.floatTitle}>Parent Multi-Child Alerts</Text>
            <Text style={styles.floatLine}>🚌 Bus Route 4 approaching Stop 3 (ETA 4 mins)</Text>
            <Text style={styles.floatLine}>✅ Layla (KG2) checked in at Gate 1 · 7:52 AM</Text>
          </View>
        </View>

        <Text style={styles.testimonial}>
          “One unified profile from Kindergarten admission to Secondary graduation. Every branch,
          academic stream, and department connected in real time.”
        </Text>
        <View style={styles.streamBadges}>
          {['National', 'British IGCSE', 'American Diploma', 'IB'].map((s) => (
            <View key={s} style={styles.streamBadge}>
              <Text style={styles.streamText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileRoot: { flex: 1, backgroundColor: colors.bgSurface, direction: 'ltr' },
  desktopRoot: { flex: 1, flexDirection: 'row', direction: 'ltr', minHeight: Platform.OS === 'web' ? ('100vh' as never) : undefined },
  left: {
    flex: 5,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  right: {
    flex: 7,
    backgroundColor: colors.bgDarkCanvas,
    padding: 48,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  formScroll: { padding: 32, gap: 14, maxWidth: 480, width: '100%', alignSelf: 'center' },
  back: { fontFamily: fonts.medium, color: colors.textSecondary, marginBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontFamily: fonts.extraBold, fontSize: 20 },
  brandName: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.textPrimary },
  brandSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  roleTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleTab: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgCanvas,
  },
  roleTabActive: { backgroundColor: colors.brandSoft, borderColor: '#C7D2FE' },
  roleTabText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  roleTabTextActive: { color: colors.brandPrimary },
  pwLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pwLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary },
  forgot: { fontFamily: fonts.medium, fontSize: 13, color: colors.brandPrimary },
  showPw: { alignSelf: 'flex-end', marginTop: 4 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rememberText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, flex: 1 },
  error: { fontFamily: fonts.medium, color: colors.statusDanger, textAlign: 'center' },
  demoToggle: { marginTop: 4 },
  demoToggleText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary },
  demoBox: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: 12,
    backgroundColor: colors.bgCanvas,
  },
  demoPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoPill: {
    borderRadius: radii.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoPillText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  help: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.brandPrimary, textAlign: 'center' },
  secure: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  rightH: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: '#fff',
    letterSpacing: -0.6,
    marginVertical: 20,
    maxWidth: 480,
  },
  floatStack: { gap: 16, maxWidth: 440 },
  floatCard: {
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radii['2xl'],
    padding: 16,
    gap: 8,
    marginLeft: 40,
  },
  floatTitle: { fontFamily: fonts.semiBold, color: '#A5B4FC', fontSize: 13 },
  floatLine: { fontFamily: fonts.regular, color: colors.textOnDark, fontSize: 13, lineHeight: 20 },
  testimonial: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    lineHeight: 22,
    marginTop: 24,
    maxWidth: 480,
  },
  streamBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  streamBadge: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streamText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textOnDarkMuted },
});
