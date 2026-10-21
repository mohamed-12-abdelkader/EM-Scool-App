import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'em.phase1.attendance.offline';

export type OfflineAttendanceEntry = {
  student_id: string;
  section_id: string;
  attendance_date: string;
  period_number: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  source: 'MOBILE_APP';
  queuedAt: string;
};

export async function queueOfflineAttendance(entries: OfflineAttendanceEntry[]) {
  const existing = await loadOfflineAttendance();
  await AsyncStorage.setItem(KEY, JSON.stringify([...existing, ...entries]));
}

export async function loadOfflineAttendance(): Promise<OfflineAttendanceEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as OfflineAttendanceEntry[];
}

export async function clearOfflineAttendance() {
  await AsyncStorage.removeItem(KEY);
}
