import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  clearOfflineAttendance,
  loadOfflineAttendance,
  queueOfflineAttendance,
  type OfflineAttendanceEntry,
} from '@/lib/attendanceOffline';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

type Row = { id: string; full_name: string; status: OfflineAttendanceEntry['status'] };

function tone(s: Row['status']) {
  if (s === 'PRESENT') return 'emerald' as const;
  if (s === 'LATE') return 'amber' as const;
  if (s === 'ABSENT') return 'rose' as const;
  return 'slate' as const;
}

export default function TeacherAttendance() {
  const { accessToken, user } = useAuth();
  const [sectionId] = useState('00000000-0000-0000-0000-000000000001');
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadStudents = async () => {
    const students = await apiRequest<{ id: string; full_name: string }[]>('/v1/sis/students', {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      branchId: user?.branchIds?.[0],
    });
    setRows(students.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  const cycle = (id: string) => {
    const order: Row['status'][] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, status: order[(order.indexOf(r.status) + 1) % order.length] };
      }),
    );
  };

  const saveOnlineOrOffline = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const entries: OfflineAttendanceEntry[] = rows.map((r) => ({
      student_id: r.id,
      section_id: sectionId,
      attendance_date: today,
      period_number: 0,
      status: r.status,
      source: 'MOBILE_APP',
      queuedAt: new Date().toISOString(),
    }));

    try {
      await apiRequest('/v1/sis/attendance/batch', {
        method: 'POST',
        token: accessToken || undefined,
        tenantId: user?.tenantId || undefined,
        branchId: user?.branchIds?.[0],
        body: { entries: entries.map(({ queuedAt, ...e }) => e) },
      });
      setMessage('Saved to server · BullMQ alerts queued for ABSENT/LATE');
    } catch {
      await queueOfflineAttendance(entries);
      setMessage('Offline — queued locally for sync');
    }
  };

  const syncOffline = async () => {
    const queued = await loadOfflineAttendance();
    if (!queued.length) {
      setMessage('No offline records');
      return;
    }
    await apiRequest('/v1/sis/attendance/batch', {
      method: 'POST',
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      body: { entries: queued.map(({ queuedAt, ...e }) => e) },
    });
    await clearOfflineAttendance();
    setMessage(`Synced ${queued.length} offline records`);
  };

  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const absent = rows.filter((r) => r.status === 'ABSENT').length;
  const late = rows.filter((r) => r.status === 'LATE').length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Attendance · Morning Roll Call</Text>
      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Text style={styles.kpiV}>{present}</Text>
          <Text style={styles.kpiL}>Present</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiV}>{absent}</Text>
          <Text style={styles.kpiL}>Absent</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiV}>{late}</Text>
          <Text style={styles.kpiL}>Late</Text>
        </View>
      </View>
      <Button label="Load class roster" onPress={() => void loadStudents().catch(() => setRows([]))} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <Pressable style={[styles.row, shadows.sm]} onPress={() => cycle(item.id)}>
            <Text style={styles.name}>{item.full_name}</Text>
            <PillBadge label={item.status} tone={tone(item.status)} />
          </Pressable>
        )}
      />
      <Button label="Save attendance" onPress={() => void saveOnlineOrOffline()} />
      <Button
        label="Sync offline queue"
        variant="outline"
        onPress={() => void syncOffline().catch((e) => setMessage(String(e)))}
      />
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: colors.bgCanvas, gap: 10 },
  h1: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5 },
  kpis: { flexDirection: 'row', gap: 8 },
  kpi: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
  },
  kpiV: { fontFamily: fonts.monoMedium, fontSize: 22, color: colors.brandPrimary, fontVariant: ['tabular-nums'] },
  kpiL: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  name: { fontFamily: fonts.semiBold, color: colors.textPrimary },
  msg: { fontFamily: fonts.medium, color: colors.textSecondary, textAlign: 'center' },
});
