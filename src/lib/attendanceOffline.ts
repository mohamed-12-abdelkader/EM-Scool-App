import { Platform } from 'react-native';
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

type SqliteDb = {
  execAsync: (sql: string) => Promise<void>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  runAsync: (sql: string, params?: unknown[]) => Promise<unknown>;
};

let sqliteDb: SqliteDb | null = null;
let sqliteTried = false;

async function getSqlite(): Promise<SqliteDb | null> {
  if (Platform.OS === 'web') return null;
  if (sqliteTried) return sqliteDb;
  sqliteTried = true;
  try {
    // Optional native dependency — falls back to AsyncStorage if unavailable
    const mod = await import('expo-sqlite');
    const db = (await mod.openDatabaseAsync('em_phase1_attendance.db')) as SqliteDb;
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT NOT NULL
      );
    `);
    sqliteDb = db;
    return db;
  } catch {
    sqliteDb = null;
    return null;
  }
}

export async function queueOfflineAttendance(entries: OfflineAttendanceEntry[]) {
  const db = await getSqlite();
  if (db) {
    for (const entry of entries) {
      await db.runAsync('INSERT INTO offline_attendance (payload) VALUES (?)', [
        JSON.stringify(entry),
      ]);
    }
    return;
  }
  const existing = await loadOfflineAttendance();
  await AsyncStorage.setItem(KEY, JSON.stringify([...existing, ...entries]));
}

export async function loadOfflineAttendance(): Promise<OfflineAttendanceEntry[]> {
  const db = await getSqlite();
  if (db) {
    const rows = await db.getAllAsync<{ payload: string }>(
      'SELECT payload FROM offline_attendance ORDER BY id ASC',
    );
    return rows.map((r) => JSON.parse(r.payload) as OfflineAttendanceEntry);
  }
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  return JSON.parse(raw) as OfflineAttendanceEntry[];
}

export async function clearOfflineAttendance() {
  const db = await getSqlite();
  if (db) {
    await db.execAsync('DELETE FROM offline_attendance');
    return;
  }
  await AsyncStorage.removeItem(KEY);
}

export function offlineStorageMode(): 'sqlite' | 'async' | 'web-async' {
  if (Platform.OS === 'web') return 'web-async';
  return sqliteDb ? 'sqlite' : 'async';
}
