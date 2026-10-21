import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PillBadge } from './Badge';
import { MockWidget, MockRow } from './MockWidget';
import { colors, fonts, radii } from '@/theme/tokens';

type RolePreview = {
  id: string;
  label: string;
  scope: string;
  kpis: { value: string; label: string }[];
  rows: { title: string; subtitle: string; badge: string; tone: 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' }[];
};

const roles: RolePreview[] = [
  {
    id: 'super',
    label: 'Super Admin',
    scope: 'Scope: Cross-Tenant',
    kpis: [
      { value: '12', label: 'Tenants' },
      { value: '98.1%', label: 'Uptime' },
      { value: '4', label: 'Queues OK' },
    ],
    rows: [
      { title: 'Demo K12 School', subtitle: 'ENTERPRISE · SIS+LMS+ERP', badge: 'Active', tone: 'emerald' },
      { title: 'Quota watch', subtitle: '2 tenants near student cap', badge: 'Alert', tone: 'amber' },
    ],
  },
  {
    id: 'principal',
    label: 'Branch Manager / Principal',
    scope: 'Scope: Cross-Branch',
    kpis: [
      { value: '96.4%', label: 'Attendance' },
      { value: '87%', label: 'Fees' },
      { value: '3', label: 'Branches' },
    ],
    rows: [
      { title: 'Morning attendance', subtitle: 'Synced ZKTeco + Mobile', badge: 'Live', tone: 'emerald' },
      { title: 'Admissions conversion', subtitle: '45.3% this cycle', badge: 'On track', tone: 'indigo' },
    ],
  },
  {
    id: 'admissions',
    label: 'Admissions Officer',
    scope: 'Scope: Branch SIS',
    kpis: [
      { value: '64', label: 'Enquiries' },
      { value: '41', label: 'Applied' },
      { value: '29', label: 'Enrolled' },
    ],
    rows: [
      { title: 'Sara Ahmed · Grade 7', subtitle: 'Walk-in', badge: 'Exam Scheduled', tone: 'amber' },
      { title: 'Layla Hassan · KG1', subtitle: 'WhatsApp', badge: 'Enrolled ✓', tone: 'emerald' },
    ],
  },
  {
    id: 'hod',
    label: 'Academic Coordinator / HOD',
    scope: 'Scope: Stage / Department',
    kpis: [
      { value: '74%', label: 'Class Avg' },
      { value: '32', label: 'Graded' },
      { value: '3', label: 'At Risk' },
    ],
    rows: [
      { title: 'Omar Safi', subtitle: 'Physics · Term 2', badge: 'At risk', tone: 'rose' },
      { title: 'Substitute Period 3', subtitle: 'Ms. Roya sick leave', badge: 'Assigned', tone: 'indigo' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance Manager',
    scope: 'Scope: Branch ERP',
    kpis: [
      { value: '87%', label: 'Collected' },
      { value: '$18.2k', label: 'Outstanding' },
      { value: '41', label: 'Reminders' },
    ],
    rows: [
      { title: 'Sibling discounts', subtitle: '2nd/3rd child auto-applied', badge: 'Reconciled', tone: 'emerald' },
      { title: 'Term 2 invoices', subtitle: 'Bulk BullMQ run', badge: 'Sent', tone: 'indigo' },
    ],
  },
  {
    id: 'hr',
    label: 'HR & Payroll Specialist',
    scope: 'Scope: Branch ERP HR',
    kpis: [
      { value: '86', label: 'Staff' },
      { value: '4', label: 'Leave' },
      { value: '100%', label: 'Payroll' },
    ],
    rows: [
      { title: 'Ms. Roya · Sick leave', subtitle: 'Periods auto-covered', badge: 'Synced', tone: 'amber' },
      { title: 'April payroll', subtitle: 'Biometric hours verified', badge: 'Ready', tone: 'emerald' },
    ],
  },
  {
    id: 'library',
    label: 'Librarian & Inventory',
    scope: 'Scope: Branch Library',
    kpis: [
      { value: '1.2k', label: 'Books' },
      { value: '38', label: 'Out' },
      { value: '6', label: 'Overdue' },
    ],
    rows: [
      { title: 'ISBN checkout', subtitle: 'Barcode / RFID scan', badge: 'Live', tone: 'indigo' },
      { title: 'Fine sync', subtitle: 'Linked to fee ledger', badge: 'Auto', tone: 'emerald' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport & Fleet Manager',
    scope: 'Scope: Branch Fleet',
    kpis: [
      { value: '38', label: 'Students' },
      { value: 'On route', label: 'Status' },
      { value: '3', label: 'Stops left' },
    ],
    rows: [
      { title: 'Route 4 · Stop 3', subtitle: 'ETA 4 mins', badge: 'Approaching', tone: 'amber' },
      { title: 'RFID boarding', subtitle: '12 boarded at Stop 2', badge: 'Logged', tone: 'emerald' },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    scope: 'Scope: Assigned Classes',
    kpis: [
      { value: '29', label: 'Present' },
      { value: '3', label: 'Absent' },
      { value: '2', label: 'Late' },
    ],
    rows: [
      { title: 'Grade 8A roll call', subtitle: 'Offline-ready SQLite sync', badge: 'Ready', tone: 'indigo' },
      { title: 'Homework due Friday', subtitle: 'Physics worksheet', badge: 'Published', tone: 'emerald' },
    ],
  },
  {
    id: 'parent',
    label: 'Parent / Guardian',
    scope: 'Scope: Linked Family Group',
    kpis: [
      { value: '2', label: 'Children' },
      { value: '4m', label: 'Bus ETA' },
      { value: '1', label: 'Invoice' },
    ],
    rows: [
      { title: 'Multi-child switcher', subtitle: 'KG2 & Grade 9', badge: 'Active', tone: 'indigo' },
      { title: 'Layla checked in', subtitle: 'Gate 1 · 7:52 AM', badge: 'Present', tone: 'emerald' },
    ],
  },
  {
    id: 'student',
    label: 'Student (Prep & Secondary)',
    scope: 'Scope: Self',
    kpis: [
      { value: '3.8', label: 'GPA' },
      { value: '2', label: 'Due HW' },
      { value: '1', label: 'Library' },
    ],
    rows: [
      { title: 'Today’s timetable', subtitle: 'Physics P3 · Lab B', badge: 'Now', tone: 'indigo' },
      { title: 'Assignment upload', subtitle: 'Essay draft due Fri', badge: 'Pending', tone: 'amber' },
    ],
  },
];

export function RoleDashboardSwitcher() {
  const [active, setActive] = useState(roles[1].id);
  const role = roles.find((r) => r.id === active) || roles[1];

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>HOW IT WORKS FOR YOUR INSTITUTION</Text>
      <Text style={styles.h2}>Built with pre-defined role-based dashboards</Text>
      <Text style={styles.p}>
        Every stakeholder sees only what is relevant to their responsibility — mapped 1:1 to our 11-role
        RBAC matrix.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {roles.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => setActive(r.id)}
            style={[styles.pill, active === r.id && styles.pillActive]}
          >
            <Text style={[styles.pillText, active === r.id && styles.pillTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.preview}>
        <PillBadge label={role.scope} tone="violet" />
        <MockWidget title={`${role.label} · Live Preview`} kpis={role.kpis}>
          {role.rows.map((row) => (
            <MockRow
              key={row.title}
              title={row.title}
              subtitle={row.subtitle}
              right={<PillBadge label={row.badge} tone={row.tone} />}
            />
          ))}
        </MockWidget>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 12,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.brandPrimary,
    letterSpacing: 1.2,
  },
  h2: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    maxWidth: 640,
  },
  p: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 24,
    marginBottom: 12,
  },
  pills: { gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgCanvas,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  pillText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  preview: { marginTop: 20, width: '100%', maxWidth: 520, gap: 12, alignItems: 'center' },
});
