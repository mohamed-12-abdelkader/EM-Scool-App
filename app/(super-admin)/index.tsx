import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Button, Input } from '@/components/ui';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { arFonts, brand, colors, radii, shadows, spacing } from '@/theme/tokens';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  quota_max_students?: number;
};

type BootstrapInfo = {
  tenantName: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  teacherEmail: string;
  teacherPassword: string;
};

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

async function copyText(value: string) {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through */
  }
  notify('نسخ', value);
  return false;
}

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function SuperAdminHome() {
  const { accessToken, logout, user } = useAuth();
  const { isCompact } = useBreakpoint();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastBootstrap, setLastBootstrap] = useState<BootstrapInfo | null>(null);

  const load = async () => {
    try {
      const rows = await apiRequest<Tenant[]>('/v1/tenants', { token: accessToken || undefined });
      setTenants(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر تحميل المدارس');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      const next = slugify(value);
      if (next) setSlug(next);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q),
    );
  }, [tenants, query]);

  const activeCount = tenants.filter((t) => t.is_active).length;

  const createTenant = async () => {
    const cleanSlug = slugify(slug) || slug.trim().toLowerCase();
    if (!name.trim() || !cleanSlug) {
      notify('تنبيه', 'أدخل اسم المدرسة والكود الإنجليزي (slug) مثل al-amal');
      return;
    }
    setBusy(true);
    try {
      const tenant = await apiRequest<Tenant>('/v1/tenants', {
        method: 'POST',
        token: accessToken || undefined,
        body: {
          name: name.trim(),
          slug: cleanSlug,
          subscription_plan: 'ENTERPRISE',
          quota_max_students: 2000,
          enabled_modules: ['SIS', 'LMS', 'FINANCE', 'HR', 'TRANSPORT', 'LIBRARY'],
        },
      });
      const boot = await apiRequest<{
        accounts: {
          school_admin: { email: string; password: string };
          teacher: { email: string; password: string };
        };
      }>(`/v1/tenants/${tenant.id}/bootstrap-phase1`, {
        method: 'POST',
        token: accessToken || undefined,
      });
      setLastBootstrap({
        tenantName: tenant.name,
        slug: tenant.slug,
        adminEmail: boot.accounts.school_admin.email,
        adminPassword: boot.accounts.school_admin.password,
        teacherEmail: boot.accounts.teacher.email,
        teacherPassword: boot.accounts.teacher.password,
      });
      setName('');
      setSlug('');
      setSlugTouched(false);
      await load();
    } catch (e) {
      notify('خطأ', e instanceof Error ? e.message : 'فشل الإنشاء');
    } finally {
      setBusy(false);
    }
  };

  const bootstrapExisting = async (tenantId: string, tenantSlug: string, tenantName: string) => {
    setBusy(true);
    try {
      const boot = await apiRequest<{
        accounts: {
          school_admin: { email: string; password: string };
          teacher: { email: string; password: string };
        };
      }>(`/v1/tenants/${tenantId}/bootstrap-phase1`, {
        method: 'POST',
        token: accessToken || undefined,
      });
      setLastBootstrap({
        tenantName,
        slug: tenantSlug,
        adminEmail: boot.accounts.school_admin.email,
        adminPassword: boot.accounts.school_admin.password,
        teacherEmail: boot.accounts.teacher.email,
        teacherPassword: boot.accounts.teacher.password,
      });
      await load();
    } catch (e) {
      notify('خطأ', e instanceof Error ? e.message : 'فشل الإعداد');
    } finally {
      setBusy(false);
    }
  };

  const applyUrl = lastBootstrap
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/admissions-apply?slug=${lastBootstrap.slug}`
    : '';

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>
            <View>
              <Text style={styles.brandName}>{brand.wordmark}</Text>
              <Text style={styles.brandRole}>مشرف المنصة</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <View style={styles.userChip}>
              <LivePulseDot size={8} color={colors.statusSuccess} />
              <Text style={styles.userChipText} numberOfLines={1}>
                {user?.full_name ?? 'مشرف المنصة'}
              </Text>
            </View>
            <AnimatedPressable
              accessibilityLabel="تسجيل الخروج"
              onPress={() => {
                void (async () => {
                  await logout();
                  router.replace('/(auth)/signin' as never);
                })();
              }}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutText}>خروج</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isCompact && styles.scrollContentCompact]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(320)} style={styles.hero}>
          <PillBadge label="Phase 1 · إدارة المستأجرين" tone="indigo" />
          <Text style={styles.h1}>لوحة إدارة المدارس</Text>
          <Text style={styles.sub}>
            أنشئ مدرسة جديدة فيخطوتين: الاسم والكود — النظام يجهّز الفرع والعام والصف وحسابات المدير
            والمعلم تلقائياً.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).duration(320)}
          style={[styles.statsRow, isCompact && styles.statsRowCompact]}
        >
          <StatCard label="إجمالي المدارس" value={String(tenants.length)} tone="brand" />
          <StatCard label="نشطة" value={String(activeCount)} tone="emerald" />
          <StatCard
            label="جاهزة للتقديم"
            value={String(tenants.length)}
            tone="violet"
            hint="بعد إعداد Phase 1"
          />
        </Animated.View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Button label="إعادة المحاولة" size="sm" onPress={() => void load()} />
          </View>
        ) : null}

        <View style={[styles.mainGrid, isCompact && styles.mainGridCompact]}>
          <Animated.View entering={FadeInDown.delay(140).duration(320)} style={styles.colForm}>
            <View style={[styles.panel, shadows.card]}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>مدرسة جديدة</Text>
                <Text style={styles.panelHint}>إعداد كامل للمرحلة 1</Text>
              </View>

              <View style={styles.steps}>
                <Step n="1" label="الاسم والكود" active />
                <View style={styles.stepLine} />
                <Step n="2" label="تجهيز تلقائي" />
                <View style={styles.stepLine} />
                <Step n="3" label="حسابات جاهزة" />
              </View>

              <Input
                label="اسم المدرسة"
                value={name}
                onChangeText={onNameChange}
                placeholder="مدرسة الأمل الدولية"
              />
              <Input
                label="كود التقديم العام (إنجليزي)"
                value={slug}
                onChangeText={(v) => {
                  setSlugTouched(true);
                  setSlug(slugify(v) || v.toLowerCase());
                }}
                placeholder="al-amal-schools"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.slugPreview}>
                رابط التقديم:{' '}
                <Text style={styles.slugPreviewMono}>/admissions-apply · {slug || '…'}</Text>
              </Text>

              <Button
                label={busy ? 'جارٍ الإنشاء والتجهيز…' : 'إنشاء المدرسة الآن'}
                onPress={() => void createTenant()}
                disabled={busy}
                fullWidth
              />
            </View>

            {lastBootstrap ? (
              <Animated.View entering={FadeIn.duration(280)} style={[styles.credPanel, shadows.md]}>
                <View style={styles.credHead}>
                  <PillBadge label="جاهز للاستخدام" tone="emerald" />
                  <Text style={styles.credTitle}>{lastBootstrap.tenantName}</Text>
                  <Text style={styles.credSlug}>الكود: {lastBootstrap.slug}</Text>
                </View>

                <CredRow
                  label="مدير المدرسة"
                  email={lastBootstrap.adminEmail}
                  password={lastBootstrap.adminPassword}
                />
                <CredRow
                  label="معلم"
                  email={lastBootstrap.teacherEmail}
                  password={lastBootstrap.teacherPassword}
                />

                <View style={styles.applyBox}>
                  <Text style={styles.applyLabel}>رابط تقديم أولياء الأمور</Text>
                  <Text style={styles.applyUrl} numberOfLines={2}>
                    استخدم الكود «{lastBootstrap.slug}» في صفحة التقديم العام
                  </Text>
                  <View style={styles.applyActions}>
                    <Button
                      size="sm"
                      variant="outline"
                      label="نسخ الكود"
                      onPress={() => void copyText(lastBootstrap.slug)}
                    />
                    {Platform.OS === 'web' ? (
                      <Button
                        size="sm"
                        label="فتح التقديم"
                        onPress={() => {
                          window.location.href = `/admissions-apply`;
                        }}
                      />
                    ) : null}
                  </View>
                  {applyUrl ? <Text style={styles.applyHint}>{applyUrl}</Text> : null}
                </View>
              </Animated.View>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(320)} style={styles.colList}>
            <View style={[styles.panel, shadows.card, { flex: 1 }]}>
              <View style={styles.listHead}>
                <View>
                  <Text style={styles.panelTitle}>المدارس</Text>
                  <Text style={styles.panelHint}>{filtered.length} نتيجة</Text>
                </View>
                <AnimatedPressable onPress={() => void load()} style={styles.refreshChip}>
                  <Text style={styles.refreshChipText}>تحديث</Text>
                </AnimatedPressable>
              </View>

              <View style={styles.searchField}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="بحث بالاسم أو الكود…"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  textAlign="right"
                />
              </View>

              {filtered.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>
                    {tenants.length === 0 ? 'لا مدارس بعد' : 'لا نتائج للبحث'}
                  </Text>
                  <Text style={styles.emptyBody}>
                    {tenants.length === 0
                      ? 'أنشئ أول مدرسة من النموذج على اليسار — ستظهر هنا فوراً.'
                      : 'جرّب اسماً أو كوداً مختلفاً.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.schoolList}>
                  {filtered.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(240)}
                      style={styles.schoolCard}
                    >
                      <View style={styles.schoolTop}>
                        <View style={styles.schoolAvatar}>
                          <Text style={styles.schoolAvatarText}>
                            {item.name.trim().slice(0, 1) || 'م'}
                          </Text>
                        </View>
                        <View style={styles.schoolMeta}>
                          <Text style={styles.schoolName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.schoolSlug}>{item.slug}</Text>
                        </View>
                        <PillBadge
                          label={item.is_active ? 'نشط' : 'متوقف'}
                          tone={item.is_active ? 'emerald' : 'rose'}
                        />
                      </View>
                      <View style={styles.schoolFooter}>
                        <Text style={styles.quota}>
                          حد الطلاب{' '}
                          <Text style={styles.quotaNum}>{item.quota_max_students ?? '—'}</Text>
                        </Text>
                        <View style={styles.schoolActions}>
                          <Button
                            size="sm"
                            variant="ghost"
                            label="نسخ الكود"
                            onPress={() => void copyText(item.slug)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            label="تجهيز Phase 1"
                            disabled={busy}
                            onPress={() =>
                              void bootstrapExisting(item.id, item.slug, item.name)
                            }
                          />
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'emerald' | 'violet';
  hint?: string;
}) {
  const accent =
    tone === 'emerald'
      ? colors.statusSuccess
      : tone === 'violet'
        ? colors.brandAccent
        : colors.brandPrimary;
  return (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statDot, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function Step({ n, label, active }: { n: string; label: string; active?: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepBadge, active && styles.stepBadgeActive]}>
        <Text style={[styles.stepN, active && styles.stepNActive]}>{n}</Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function CredRow({
  label,
  email,
  password,
}: {
  label: string;
  email: string;
  password: string;
}) {
  return (
    <View style={styles.credRow}>
      <Text style={styles.credRole}>{label}</Text>
      <Pressable style={styles.credLine} onPress={() => void copyText(email)}>
        <Text style={styles.credMono}>{email}</Text>
        <Text style={styles.copyHint}>نسخ</Text>
      </Pressable>
      <Pressable style={styles.credLine} onPress={() => void copyText(password)}>
        <Text style={styles.credMono}>{password}</Text>
        <Text style={styles.copyHint}>نسخ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topBarInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: arFonts.bold, color: '#fff', fontSize: 16 },
  brandName: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  brandRole: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  topActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  userChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    maxWidth: 220,
  },
  userChipText: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textPrimary },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  logoutText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },

  scroll: { flex: 1 },
  scrollContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    gap: spacing.xl,
    paddingBottom: 48,
  },
  scrollContentCompact: { paddingHorizontal: spacing.lg },

  hero: { gap: 8, alignItems: 'flex-end' },
  h1: {
    fontFamily: arFonts.extraBold,
    fontSize: 30,
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 42,
  },
  sub: {
    fontFamily: arFonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 24,
    maxWidth: 640,
  },

  statsRow: { flexDirection: 'row-reverse', gap: 12 },
  statsRowCompact: { flexDirection: 'column' },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 4,
    alignItems: 'flex-end',
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statValue: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },
  statHint: { fontFamily: arFonts.regular, fontSize: 11, color: colors.textMuted },

  errorBanner: {
    backgroundColor: colors.statusDangerSoft,
    borderRadius: radii.xl,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    alignItems: 'flex-end',
  },
  errorText: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },

  mainGrid: { flexDirection: 'row-reverse', gap: 20, alignItems: 'flex-start' },
  mainGridCompact: { flexDirection: 'column' },
  colForm: { flex: 1, gap: 16, minWidth: 280, maxWidth: 440 },
  colList: { flex: 1.35, minWidth: 280 },

  panel: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 14,
  },
  panelHead: { gap: 4, alignItems: 'flex-end' },
  panelTitle: {
    fontFamily: arFonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  panelHint: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },

  steps: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCanvas,
    borderRadius: radii.lg,
    padding: 10,
    gap: 4,
  },
  step: { alignItems: 'center', gap: 4, flex: 1 },
  stepLine: { width: 12, height: 2, backgroundColor: colors.borderSubtle },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: { backgroundColor: colors.brandPrimary },
  stepN: { fontFamily: arFonts.bold, fontSize: 11, color: colors.textMuted },
  stepNActive: { color: '#fff' },
  stepLabel: { fontFamily: arFonts.regular, fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  stepLabelActive: { color: colors.brandPrimary, fontFamily: arFonts.semiBold },

  slugPreview: {
    fontFamily: arFonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  slugPreviewMono: { fontFamily: arFonts.mono, color: colors.brandPrimary },

  credPanel: {
    backgroundColor: '#ECFDF5',
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    padding: 18,
    gap: 12,
  },
  credHead: { gap: 4, alignItems: 'flex-end' },
  credTitle: {
    fontFamily: arFonts.bold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  credSlug: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  credRow: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  credRole: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  credLine: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  credMono: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textPrimary, flex: 1, textAlign: 'right' },
  copyHint: { fontFamily: arFonts.semiBold, fontSize: 11, color: colors.brandPrimary },

  applyBox: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  applyLabel: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  applyUrl: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textPrimary, textAlign: 'right' },
  applyActions: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  applyHint: { fontFamily: arFonts.mono, fontSize: 10, color: colors.textMuted, textAlign: 'right' },

  listHead: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refreshChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
  },
  refreshChipText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.brandPrimary },

  searchField: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    backgroundColor: colors.bgCanvas,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  searchInput: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 10,
    outlineStyle: 'none' as never,
  },

  empty: { paddingVertical: 40, gap: 8, alignItems: 'center' },
  emptyTitle: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary },
  emptyBody: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  schoolList: { gap: 10 },
  schoolCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: 14,
    gap: 12,
    backgroundColor: colors.bgCanvas,
  },
  schoolTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  schoolAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolAvatarText: { fontFamily: arFonts.bold, fontSize: 16, color: colors.brandPrimary },
  schoolMeta: { flex: 1, gap: 2 },
  schoolName: {
    fontFamily: arFonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  schoolSlug: { fontFamily: arFonts.mono, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  schoolFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  quota: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textSecondary },
  quotaNum: { fontFamily: arFonts.monoMedium, fontVariant: ['tabular-nums'] },
  schoolActions: { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap' },
});
