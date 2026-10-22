import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Button, Input } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

type Tenant = { id: string; name: string; slug: string; is_active: boolean; quota_max_students?: number };

function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function SuperAdminHome() {
  const { accessToken, logout, user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastBootstrap, setLastBootstrap] = useState<string | null>(null);

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

  const createTenant = async () => {
    if (!name.trim() || !slug.trim()) {
      notify('تنبيه', 'أدخل اسم المدرسة والكود (slug)');
      return;
    }
    setBusy(true);
    try {
      const tenant = await apiRequest<Tenant>('/v1/tenants', {
        method: 'POST',
        token: accessToken || undefined,
        body: {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          subscription_plan: 'ENTERPRISE',
          quota_max_students: 2000,
          enabled_modules: ['SIS', 'LMS', 'FINANCE', 'HR', 'TRANSPORT', 'LIBRARY'],
        },
      });
      const boot = await apiRequest<{
        accounts: { school_admin: { email: string; password: string }; teacher: { email: string; password: string } };
        branch: { id: string };
        academic_year: { id: string };
        grade_level: { id: string };
      }>(`/v1/tenants/${tenant.id}/bootstrap-phase1`, {
        method: 'POST',
        token: accessToken || undefined,
      });
      setLastBootstrap(
        `تم إنشاء المدرسة وإعداد المرحلة 1.\n\nمدير المدرسة: ${boot.accounts.school_admin.email}\nكلمة المرور: ${boot.accounts.school_admin.password}\n\nمعلم: ${boot.accounts.teacher.email}\nكلمة المرور: ${boot.accounts.teacher.password}\n\nكود التقديم العام: ${tenant.slug}`,
      );
      setName('');
      setSlug('');
      await load();
      notify('نجاح', 'تم إنشاء المدرسة مع الفرع والعام والصف وحسابات الإدارة/المعلم');
    } catch (e) {
      notify('خطأ', e instanceof Error ? e.message : 'فشل الإنشاء');
    } finally {
      setBusy(false);
    }
  };

  const bootstrapExisting = async (tenantId: string, tenantSlug: string) => {
    setBusy(true);
    try {
      const boot = await apiRequest<{
        accounts: { school_admin: { email: string; password: string }; teacher: { email: string; password: string } };
      }>(`/v1/tenants/${tenantId}/bootstrap-phase1`, {
        method: 'POST',
        token: accessToken || undefined,
      });
      setLastBootstrap(
        `إعداد Phase 1 لـ ${tenantSlug}\n\nمدير: ${boot.accounts.school_admin.email} / ${boot.accounts.school_admin.password}\nمعلم: ${boot.accounts.teacher.email} / ${boot.accounts.teacher.password}`,
      );
      notify('تم', 'تم تجهيز هيكل المدرسة (فرع/عام/صف/حسابات)');
      await load();
    } catch (e) {
      notify('خطأ', e instanceof Error ? e.message : 'فشل الإعداد');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>مشرف المنصة</Text>
      <Text style={styles.h1}>لوحة إدارة المدارس</Text>
      <Text style={styles.sub}>
        {user?.full_name ?? 'مشرف المنصة'} · إنشاء مدرسة جديدة يجهّز تلقائياً الفرع والعام والصف وحساب المدير
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.card, shadows.card]}>
        <Text style={styles.cardTitle}>إنشاء مدرسة جديدة (Phase 1)</Text>
        <Input label="اسم المدرسة" value={name} onChangeText={setName} placeholder="مدرسة الأمل" />
        <Input
          label="الكود (slug) للتقديم العام"
          value={slug}
          onChangeText={setSlug}
          placeholder="al-amal-schools"
          autoCapitalize="none"
        />
        <Button
          label={busy ? 'جارٍ الإنشاء…' : 'إنشاء المدرسة + إعداد المرحلة 1'}
          onPress={() => void createTenant()}
          disabled={busy}
          fullWidth
        />
      </View>

      {lastBootstrap ? (
        <View style={[styles.card, styles.bootCard]}>
          <Text style={styles.bootText}>{lastBootstrap}</Text>
        </View>
      ) : null}

      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.name}</Text>
              <PillBadge
                label={item.is_active ? 'نشط' : 'متوقف'}
                tone={item.is_active ? 'emerald' : 'rose'}
              />
            </View>
            <Text style={styles.slug}>الكود: {item.slug}</Text>
            <Text style={styles.meta}>
              الحد الأقصى: <Text style={styles.mono}>{item.quota_max_students ?? '—'}</Text> طالب
            </Text>
            <Button
              label="تجهيز / تحديث Phase 1"
              variant="outline"
              size="sm"
              onPress={() => void bootstrapExisting(item.id, item.slug)}
              disabled={busy}
            />
          </View>
        )}
        ListEmptyComponent={!error ? <Text style={styles.empty}>لا توجد مدارس بعد</Text> : null}
      />
      <Button label="تحديث القائمة" onPress={() => void load()} />
      <Button label="تسجيل الخروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 8, backgroundColor: colors.bgCanvas },
  kicker: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.brandPrimary, textAlign: 'right' },
  h1: { fontFamily: arFonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'right', lineHeight: 36 },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, marginBottom: 4, textAlign: 'right', lineHeight: 22 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 8,
  },
  bootCard: { backgroundColor: colors.brandSoft, borderColor: '#C7D2FE' },
  bootText: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textPrimary, textAlign: 'right', lineHeight: 22 },
  cardTitle: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right', flex: 1 },
  slug: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  meta: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'right' },
  mono: { fontFamily: arFonts.monoMedium, fontVariant: ['tabular-nums'] },
  empty: { fontFamily: arFonts.medium, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  error: { color: colors.statusDanger, fontFamily: arFonts.medium, textAlign: 'right' },
});
