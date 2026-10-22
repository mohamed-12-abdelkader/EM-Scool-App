import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Navbar } from '@/components/marketing';
import { LandingScrollShell, LandingSection } from '@/components/marketing/LandingScroll';
import { Button, Input } from '@/components/ui';
import { admissionsAr } from '@/content/admissions.ar';
import { apiRequest } from '@/lib/api';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

const t = admissionsAr;

const DOC_TYPES = [
  { id: 'BIRTH_CERTIFICATE', label: 'شهادة الميلاد' },
  { id: 'IMMUNIZATION', label: 'سجل التطعيمات' },
  { id: 'PRIOR_TRANSCRIPT', label: 'بيان درجات سابق' },
  { id: 'NATIONAL_ID', label: 'بطاقة هوية / جواز' },
  { id: 'PHOTO', label: 'صورة شخصية' },
] as const;

type Catalog = {
  tenant: { id: string; name: string; slug: string };
  branches: { id: string; name: string; code: string }[];
  academic_years: { id: string; name: string; is_current: boolean }[];
  grade_levels: { id: string; name: string; stage: string; branch_id: string }[];
};

export default function AdmissionsApply() {
  const [tenantSlug, setTenantSlug] = useState('demo-school');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState('');
  const [yearId, setYearId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('2022-09-15');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>(['BIRTH_CERTIFICATE']);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const loadCatalog = async (slug: string) => {
    setCatalogError(null);
    try {
      const data = await apiRequest<Catalog>(`/v1/public/${slug}/catalog`);
      setCatalog(data);
      const year = data.academic_years.find((y) => y.is_current) || data.academic_years[0];
      const branch = data.branches[0];
      const grade =
        data.grade_levels.find((g) => g.branch_id === branch?.id) || data.grade_levels[0];
      setBranchId(branch?.id || '');
      setYearId(year?.id || '');
      setGradeId(grade?.id || '');
    } catch (e) {
      setCatalog(null);
      setCatalogError(
        e instanceof Error
          ? e.message
          : 'المدرسة غير موجودة أو لم يُجهَّز إعداد Phase 1 بعد',
      );
    }
  };

  useEffect(() => {
    void loadCatalog(tenantSlug);
  }, []);

  const gradesForBranch = useMemo(
    () => catalog?.grade_levels.filter((g) => !branchId || g.branch_id === branchId) || [],
    [catalog, branchId],
  );

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    try {
      if (!branchId || !yearId || !gradeId) {
        throw new Error('حمّل بيانات المدرسة أولاً (كود صحيح + إعداد Phase 1)');
      }
      const result = await apiRequest<{ id: string; status: string }>(
        `/v1/public/${tenantSlug}/admissions/apply`,
        {
          method: 'POST',
          body: {
            branch_id: branchId,
            academic_year_id: yearId,
            target_grade_id: gradeId,
            applicant_full_name: name,
            date_of_birth: dob,
            guardian_details: {
              full_name: guardianName,
              phone: guardianPhone,
              email: guardianEmail || undefined,
            },
            documents: [],
          },
        },
      );

      if (selectedDocs.length) {
        const attached = [];
        for (const docType of selectedDocs) {
          try {
            const presign = await apiRequest<{
              path: string;
              signedUrl: string | null;
              storageMode?: string;
            }>(`/v1/public/${tenantSlug}/admissions/applications/${result.id}/documents/presign`, {
              method: 'POST',
              body: {
                document_type: docType,
                content_type: 'application/pdf',
              },
            });
            attached.push({
              type: docType,
              path: presign.path,
              file_name: `${docType.toLowerCase()}.pdf`,
              status: 'PENDING' as const,
            });
          } catch {
            attached.push({
              type: docType,
              path: `local://${tenantSlug}/${result.id}/${docType}`,
              file_name: `${docType.toLowerCase()}.pdf`,
              status: 'PENDING' as const,
            });
          }
        }
        await apiRequest(`/v1/public/${tenantSlug}/admissions/applications/${result.id}/documents`, {
          method: 'POST',
          body: { documents: attached },
        });
      }

      setMsg(
        `${t.success(result.id, result.status)}${
          selectedDocs.length ? `\nتم تسجيل ${selectedDocs.length} مستند للمراجعة.` : ''
        }`,
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LandingScrollShell navbar={<Navbar />}>
        <LandingSection id="top">
          <View style={styles.scrollPad}>
            <View style={[styles.card, shadows.card]}>
              <Text style={styles.h1}>{t.title}</Text>
              <Text style={styles.sub}>{t.subtitle}</Text>
              <View style={styles.noticeBox}>
                <Text style={styles.notice}>{t.notice}</Text>
              </View>

              <Input
                label={t.tenantLabel}
                value={tenantSlug}
                onChangeText={setTenantSlug}
                placeholder={t.tenantHint}
                autoCapitalize="none"
              />
              <Button
                label="تحميل بيانات المدرسة"
                variant="outline"
                onPress={() => void loadCatalog(tenantSlug.trim())}
              />
              {catalogError ? <Text style={styles.error}>{catalogError}</Text> : null}
              {catalog ? (
                <Text style={styles.loaded}>
                  {catalog.tenant.name} · فروع: {catalog.branches.length} · صفوف:{' '}
                  {catalog.grade_levels.length}
                </Text>
              ) : null}

              {catalog?.branches.length ? (
                <View style={styles.pickBlock}>
                  <Text style={styles.pickLabel}>الفرع</Text>
                  <View style={styles.pills}>
                    {catalog.branches.map((b) => (
                      <Pressable
                        key={b.id}
                        onPress={() => setBranchId(b.id)}
                        style={[styles.pill, branchId === b.id && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, branchId === b.id && styles.pillTextActive]}>
                          {b.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {catalog?.academic_years.length ? (
                <View style={styles.pickBlock}>
                  <Text style={styles.pickLabel}>العام الدراسي</Text>
                  <View style={styles.pills}>
                    {catalog.academic_years.map((y) => (
                      <Pressable
                        key={y.id}
                        onPress={() => setYearId(y.id)}
                        style={[styles.pill, yearId === y.id && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, yearId === y.id && styles.pillTextActive]}>
                          {y.name}
                          {y.is_current ? ' (الحالي)' : ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {gradesForBranch.length ? (
                <View style={styles.pickBlock}>
                  <Text style={styles.pickLabel}>الصف المطلوب</Text>
                  <View style={styles.pills}>
                    {gradesForBranch.map((g) => (
                      <Pressable
                        key={g.id}
                        onPress={() => setGradeId(g.id)}
                        style={[styles.pill, gradeId === g.id && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, gradeId === g.id && styles.pillTextActive]}>
                          {g.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Input label={t.nameLabel} value={name} onChangeText={setName} />
              <Input label={t.dobLabel} value={dob} onChangeText={setDob} />
              <Input label={t.guardianNameLabel} value={guardianName} onChangeText={setGuardianName} />
              <Input
                label={t.guardianPhoneLabel}
                value={guardianPhone}
                onChangeText={setGuardianPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="بريد ولي الأمر (لاختيار حساب بعد التسجيل)"
                value={guardianEmail}
                onChangeText={setGuardianEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="parent@example.com"
              />

              <View style={styles.pickBlock}>
                <Text style={styles.pickLabel}>المستندات المطلوبة</Text>
                <Text style={styles.docHint}>
                  اختر المستندات المرفقة مع الطلب
                  {Platform.OS === 'web' ? ' (يُسجَّل المسار للمراجعة الإدارية)' : ''}.
                </Text>
                <View style={styles.pills}>
                  {DOC_TYPES.map((d) => {
                    const on = selectedDocs.includes(d.id);
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => toggleDoc(d.id)}
                        style={[styles.pill, on && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, on && styles.pillTextActive]}>{d.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Button
                label={loading ? t.submitting : t.submit}
                fullWidth
                size="lg"
                onPress={() => void submit()}
                disabled={loading}
              />
              {msg ? <Text style={styles.msg}>{msg}</Text> : null}
              <Button
                label={t.back}
                variant="ghost"
                onPress={() => router.push('/(public)' as never)}
              />
            </View>
          </View>
        </LandingSection>
      </LandingScrollShell>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  scrollPad: { padding: 24, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 24,
    gap: 12,
  },
  h1: { fontFamily: arFonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'right', lineHeight: 36 },
  sub: { fontFamily: arFonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 24, textAlign: 'right' },
  noticeBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 12,
  },
  notice: { fontFamily: arFonts.medium, fontSize: 13, color: colors.brandPrimary, lineHeight: 22, textAlign: 'right' },
  loaded: { fontFamily: arFonts.medium, fontSize: 13, color: colors.statusSuccess, textAlign: 'right' },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
  pickBlock: { gap: 8 },
  pickLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textPrimary, textAlign: 'right' },
  pills: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgCanvas,
  },
  pillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  pillText: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  msg: { fontFamily: arFonts.semiBold, color: colors.brandPrimary, textAlign: 'center', lineHeight: 22 },
  docHint: {
    fontFamily: arFonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: 18,
  },
});
