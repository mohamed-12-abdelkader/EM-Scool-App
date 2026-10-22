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
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Button, Input } from '@/components/ui';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LevitatingView } from '@/components/ui/LevitatingView';
import { PillBadge } from '@/components/marketing';
import { MockWidget, MockRow } from '@/components/marketing/MockWidget';
import { authAr } from '@/content/auth.ar';
import { roleHome, useAuth } from '@/lib/auth';
import { arFonts, brand, colors, MOTION, radii, shadows, SPRING_SNAPPY } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const t = authAr;

export default function SignInPage() {
  const { login } = useAuth();
  const { isDesktop } = useBreakpoint();
  const reduced = useReducedMotion();
  const [roleTab, setRoleTab] = useState<(typeof t.roleTabs)[number]>(t.roleTabs[0]);
  const [tenantSlug, setTenantSlug] = useState('demo-school');
  const [identifier, setIdentifier] = useState('admin@emschool.local');
  const [password, setPassword] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [demoOpen, setDemoOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const flash = useSharedValue(0);
  const ctaScale = useSharedValue(1);

  const flashStyle = useAnimatedStyle(() => ({
    borderColor: flash.value > 0.5 ? colors.brandPrimary : colors.borderSubtle,
    backgroundColor: flash.value > 0.5 ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
  }));

  const ctaAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const playDemoFill = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    if (reduced) return;
    flash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 420 }));
    ctaScale.value = withSequence(withSpring(1.03, SPRING_SNAPPY), withSpring(1, SPRING_SNAPPY));
  };

  const isEmail = useMemo(() => identifier.includes('@'), [identifier]);
  void isEmail;
  void tenantSlug;

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(identifier.trim(), password);
      router.replace(roleHome(user.role) as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.failed);
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.push('/(public)' as never)}>
        <Text style={styles.back}>{t.back}</Text>
      </Pressable>

      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>{brand.wordmark}</Text>
          <Text style={styles.brandSub}>{t.brandSub}</Text>
        </View>
      </View>

      <Animated.View style={[styles.flashWrap, flashStyle]}>
        <Input
          label={t.tenantLabel}
          value={tenantSlug}
          onChangeText={setTenantSlug}
          placeholder={t.tenantPlaceholder}
        />
      </Animated.View>

      <View style={styles.roleTabs}>
        {t.roleTabs.map((tab) => (
          <AnimatedPressable
            key={tab}
            onPress={() => setRoleTab(tab)}
            style={[styles.roleTab, roleTab === tab && styles.roleTabActive]}
          >
            <Text style={[styles.roleTabText, roleTab === tab && styles.roleTabTextActive]}>{tab}</Text>
          </AnimatedPressable>
        ))}
      </View>

      <Animated.View style={[styles.flashWrap, flashStyle]}>
        <Input
          label={t.identifierLabel}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={t.identifierPlaceholder}
          autoCapitalize="none"
          icon="UserCheck"
        />
      </Animated.View>

      <View>
        <View style={styles.pwLabelRow}>
          <Text style={styles.pwLabel}>{t.password}</Text>
          <Pressable>
            <Text style={styles.forgot}>{t.forgot}</Text>
          </Pressable>
        </View>
        <Animated.View style={[styles.flashWrap, flashStyle]}>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon="Lock"
          />
        </Animated.View>
        <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.showPw}>
          <Text style={styles.forgot}>{showPassword ? t.hidePassword : t.showPassword}</Text>
        </Pressable>
      </View>

      <View style={styles.rememberRow}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
        />
        <Text style={styles.rememberText}>{t.remember}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Animated.View style={ctaAnimStyle}>
        <Button
          label={loading ? t.submitting : t.submit}
          fullWidth
          size="lg"
          onPress={() => void onSubmit()}
          disabled={loading}
        />
      </Animated.View>

      <Pressable onPress={() => setDemoOpen((v) => !v)} style={styles.demoToggle}>
        <Text style={styles.demoToggleText}>
          ⚡ {t.demoToggle} {demoOpen ? '▾' : '▸'}
        </Text>
      </Pressable>
      {demoOpen ? (
        <View style={styles.demoBox}>
          <View style={styles.demoPills}>
            {t.demoLogins.map((d) => (
              <AnimatedPressable
                key={d.label}
                style={styles.demoPill}
                onPress={() => playDemoFill(d.email, d.password)}
              >
                <Text style={styles.demoPillText}>{d.label}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/(public)/admissions-apply')}>
        <Text style={styles.help}>{t.helpApply}</Text>
      </Pressable>
      <Text style={styles.secure}>{t.secure}</Text>
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
        <PillBadge label={`✦ ${t.showcaseBadge}`} tone="dark" />
        <Text style={styles.rightH}>{t.showcaseTitle}</Text>

        <View style={styles.floatStack}>
          <LevitatingView delayMs={0}>
            <MockWidget
              dark
              title={t.floatTitle}
              kpis={[...t.floatKpis]}
              footer={t.floatFooter}
            >
              <MockRow
                dark
                title={t.floatRowTitle}
                subtitle={t.floatRowSub}
                right={<PillBadge label={t.floatLive} tone="emerald" />}
              />
            </MockWidget>
          </LevitatingView>

          <LevitatingView delayMs={MOTION.levitatePhaseMs} style={[styles.floatCard, shadows.card]}>
            <Text style={styles.floatTitle}>{t.alertTitle}</Text>
            <Text style={styles.floatLine}>🚌 {t.alertBus}</Text>
            <Text style={styles.floatLine}>✅ {t.alertGate}</Text>
          </LevitatingView>
        </View>

        <Text style={styles.testimonial}>{t.testimonial}</Text>
        <View style={styles.streamBadges}>
          {t.streams.map((s) => (
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
  mobileRoot: { flex: 1, backgroundColor: colors.bgSurface },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row-reverse',
    minHeight: Platform.OS === 'web' ? ('100vh' as never) : undefined,
  },
  left: {
    flex: 5,
    backgroundColor: colors.bgSurface,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
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
  back: { fontFamily: arFonts.medium, color: colors.textSecondary, marginBottom: 8, textAlign: 'right' },
  brandRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontFamily: arFonts.extraBold, fontSize: 20 },
  brandName: { fontFamily: arFonts.extraBold, fontSize: 22, color: colors.textPrimary, textAlign: 'right' },
  brandSub: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  flashWrap: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 2,
  },
  roleTabs: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  roleTab: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgCanvas,
  },
  roleTabActive: { backgroundColor: colors.brandSoft, borderColor: '#C7D2FE' },
  roleTabText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.textSecondary },
  roleTabTextActive: { color: colors.brandPrimary },
  pwLabelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 6 },
  pwLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textPrimary },
  forgot: { fontFamily: arFonts.medium, fontSize: 13, color: colors.brandPrimary },
  showPw: { alignSelf: 'flex-start', marginTop: 4 },
  rememberRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  rememberText: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textSecondary, flex: 1, textAlign: 'right' },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'center' },
  demoToggle: { marginTop: 4 },
  demoToggleText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textPrimary, textAlign: 'right' },
  demoBox: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: 12,
    backgroundColor: colors.bgCanvas,
  },
  demoPills: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  demoPill: {
    borderRadius: radii.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoPillText: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textSecondary },
  help: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.brandPrimary, textAlign: 'center' },
  secure: { fontFamily: arFonts.regular, fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  rightH: {
    fontFamily: arFonts.extraBold,
    fontSize: 26,
    color: '#fff',
    marginVertical: 20,
    maxWidth: 480,
    textAlign: 'right',
    lineHeight: 38,
  },
  floatStack: { gap: 16, maxWidth: 440, alignSelf: 'flex-end', width: '100%' },
  floatCard: {
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radii['2xl'],
    padding: 16,
    gap: 8,
    marginRight: 40,
  },
  floatTitle: { fontFamily: arFonts.semiBold, color: '#A5B4FC', fontSize: 13, textAlign: 'right' },
  floatLine: { fontFamily: arFonts.regular, color: colors.textOnDark, fontSize: 13, lineHeight: 20, textAlign: 'right' },
  testimonial: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    lineHeight: 24,
    marginTop: 24,
    maxWidth: 480,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  streamBadges: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 12, alignSelf: 'flex-end' },
  streamBadge: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streamText: { fontFamily: arFonts.medium, fontSize: 11, color: colors.textOnDarkMuted },
});
