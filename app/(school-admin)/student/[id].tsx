import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Guardian = { id: string; full_name: string; phone?: string; can_pickup?: boolean };
type Sibling = { id: string; full_name: string };
type Clinic = { id: string; symptoms?: string; treatment?: string; visited_at?: string };
type Behavior = {
  id: string;
  incident_type?: string;
  description?: string;
  points?: number;
};

type Profile = {
  student: {
    id: string;
    full_name: string;
    student_code: string;
    branch_id: string;
    disciplinary_points?: number;
    medical_profile?: {
      allergies?: string[];
      conditions?: string[];
      blood_type?: string;
      emergency_notes?: string;
    } | null;
  };
  guardians?: Guardian[];
  siblings?: Sibling[];
  clinic_visits?: Clinic[];
  behavior_incidents?: Behavior[];
};

export default function StudentProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const [data, setData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatment, setTreatment] = useState('');
  const [behaviorDesc, setBehaviorDesc] = useState('');
  const [behaviorPoints, setBehaviorPoints] = useState('1');
  const [behaviorType, setBehaviorType] = useState<'MERIT' | 'DEMERIT'>('MERIT');

  const headers = {
    token: accessToken || undefined,
    tenantId: user?.tenantId || undefined,
    branchId: user?.branchIds?.[0],
  };

  const load = async () => {
    if (!id) return;
    try {
      const d = await apiRequest<Profile>(`/v1/sis/students/${id}`, headers);
      setData(d);
      const m = d.student.medical_profile || {};
      setAllergies((m.allergies || []).join('، '));
      setConditions((m.conditions || []).join('، '));
      setBloodType(m.blood_type || '');
      setEmergencyNotes(m.emergency_notes || '');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر التحميل');
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveMedical = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await apiRequest(`/v1/sis/students/${id}/medical`, {
        method: 'PATCH',
        ...headers,
        body: {
          medical_profile: {
            allergies: allergies.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
            conditions: conditions.split(/[،,]/).map((s) => s.trim()).filter(Boolean),
            blood_type: bloodType || undefined,
            emergency_notes: emergencyNotes,
          },
        },
      });
      setMsg('تم حفظ الملف الطبي');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setBusy(false);
    }
  };

  const addClinic = async () => {
    if (!id || !data || !symptoms.trim()) return;
    setBusy(true);
    try {
      await apiRequest('/v1/sis/clinic-visits', {
        method: 'POST',
        ...headers,
        body: {
          student_id: id,
          branch_id: data.student.branch_id || headers.branchId,
          symptoms: symptoms.trim(),
          treatment: treatment.trim() || undefined,
          parent_contacted: true,
        },
      });
      setSymptoms('');
      setTreatment('');
      setMsg('تم تسجيل زيارة العيادة');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'فشل التسجيل');
    } finally {
      setBusy(false);
    }
  };

  const addBehavior = async () => {
    if (!id || !data || !behaviorDesc.trim()) return;
    setBusy(true);
    try {
      const pts = Number(behaviorPoints) || 1;
      await apiRequest('/v1/sis/behavior', {
        method: 'POST',
        ...headers,
        body: {
          student_id: id,
          branch_id: data.student.branch_id || headers.branchId,
          incident_type: behaviorType,
          points: behaviorType === 'MERIT' ? Math.abs(pts) : -Math.abs(pts),
          description: behaviorDesc.trim(),
        },
      });
      setBehaviorDesc('');
      setMsg('تم تسجيل السلوك');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'فشل التسجيل');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.error}>{error}</Text>
        <Button label="رجوع" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.meta}>جارٍ التحميل…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <Button label="← رجوع للدليل" variant="ghost" onPress={() => router.back()} />
      <Text style={styles.h1}>{data.student.full_name}</Text>
      <Text style={styles.meta}>{data.student.student_code}</Text>
      <View style={styles.badgeRow}>
        <PillBadge
          label={`نقاط انضباط: ${data.student.disciplinary_points ?? 0}`}
          tone={(data.student.disciplinary_points || 0) < 0 ? 'rose' : 'emerald'}
        />
      </View>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}

      <View style={[styles.panel, shadows.card]}>
        <Text style={styles.section}>الملف الطبي</Text>
        <Input label="الحساسية (افصل بفاصلة)" value={allergies} onChangeText={setAllergies} />
        <Input label="أمراض مزمنة" value={conditions} onChangeText={setConditions} />
        <Input label="فصيلة الدم" value={bloodType} onChangeText={setBloodType} placeholder="A+" />
        <Input
          label="ملاحظات طوارئ"
          value={emergencyNotes}
          onChangeText={setEmergencyNotes}
          multiline
        />
        <Button label={busy ? '…' : 'حفظ الطبي'} onPress={() => void saveMedical()} disabled={busy} />
      </View>

      <View style={[styles.panel, shadows.card]}>
        <Text style={styles.section}>زيارة عيادة جديدة</Text>
        <Input label="الأعراض" value={symptoms} onChangeText={setSymptoms} />
        <Input label="العلاج" value={treatment} onChangeText={setTreatment} />
        <Button label="تسجيل الزيارة" onPress={() => void addClinic()} disabled={busy || !symptoms.trim()} />
        <Text style={styles.listTitle}>آخر الزيارات</Text>
        {(data.clinic_visits || []).length === 0 ? (
          <Text style={styles.body}>لا زيارات</Text>
        ) : (
          data.clinic_visits?.slice(0, 5).map((c) => (
            <Text key={c.id} style={styles.body}>
              {c.symptoms}
              {c.treatment ? ` · ${c.treatment}` : ''}
            </Text>
          ))
        )}
      </View>

      <View style={[styles.panel, shadows.card]}>
        <Text style={styles.section}>سلوك / انضباط</Text>
        <View style={styles.typeRow}>
          <Button
            size="sm"
            label="إيجابي (Merit)"
            variant={behaviorType === 'MERIT' ? 'primary' : 'outline'}
            onPress={() => setBehaviorType('MERIT')}
          />
          <Button
            size="sm"
            label="سلبي (Demerit)"
            variant={behaviorType === 'DEMERIT' ? 'danger' : 'outline'}
            onPress={() => setBehaviorType('DEMERIT')}
          />
        </View>
        <Input label="الوصف" value={behaviorDesc} onChangeText={setBehaviorDesc} />
        <Input
          label="النقاط"
          value={behaviorPoints}
          onChangeText={setBehaviorPoints}
          keyboardType="number-pad"
        />
        <Button
          label="تسجيل السلوك"
          onPress={() => void addBehavior()}
          disabled={busy || !behaviorDesc.trim()}
        />
        <Text style={styles.listTitle}>السجل</Text>
        {(data.behavior_incidents || []).length === 0 ? (
          <Text style={styles.body}>لا حوادث</Text>
        ) : (
          data.behavior_incidents?.slice(0, 8).map((b) => (
            <Text key={b.id} style={styles.body}>
              {b.incident_type}: {b.description} ({b.points})
            </Text>
          ))
        )}
      </View>

      <View style={[styles.panel, shadows.sm]}>
        <Text style={styles.section}>أولياء الأمور</Text>
        {(data.guardians || []).length === 0 ? (
          <Text style={styles.body}>لا أولياء</Text>
        ) : (
          data.guardians?.map((g) => (
            <Text key={g.id} style={styles.body}>
              {g.full_name}
              {g.phone ? ` · ${g.phone}` : ''}
              {g.can_pickup ? ' · استلام' : ''}
            </Text>
          ))
        )}
        <Text style={[styles.section, { marginTop: 12 }]}>الإخوة</Text>
        {(data.siblings || []).length === 0 ? (
          <Text style={styles.body}>لا إخوة</Text>
        ) : (
          data.siblings?.map((s) => (
            <Text key={s.id} style={styles.body}>
              {s.full_name}
            </Text>
          ))
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    gap: 12,
    backgroundColor: colors.bgCanvas,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  h1: {
    fontFamily: arFonts.extraBold,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  meta: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  badgeRow: { flexDirection: 'row-reverse' },
  msg: { fontFamily: arFonts.medium, color: colors.brandPrimary, textAlign: 'right' },
  panel: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 10,
  },
  section: {
    fontFamily: arFonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  listTitle: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  body: {
    fontFamily: arFonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  typeRow: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  error: { fontFamily: arFonts.medium, color: colors.statusDanger, textAlign: 'right' },
});
