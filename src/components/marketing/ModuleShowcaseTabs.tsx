import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PillBadge } from './Badge';
import { MockWidget, MockRow } from './MockWidget';
import { colors, fonts, radii } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Tab = {
  id: string;
  label: string;
  headline: string;
  copy: string;
  widgetTitle: string;
  kpis: { value: string; label: string }[];
  rows: { title: string; subtitle: string; badge: string; tone: 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' }[];
  footer: string;
};

const tabs: Tab[] = [
  {
    id: 'admissions',
    label: 'Admissions & SIS',
    headline: 'From first enquiry to enrolled student.',
    copy: 'Configurable online application portal with age-at-admission cutoff validation, private document verification vault, entrance exam scheduling, automated waitlist engine, and permanent Student Code + Family Group ID.',
    widgetTitle: 'Admissions Pipeline · Academic Year 2026/2027',
    kpis: [
      { value: '64', label: 'Enquiries' },
      { value: '41', label: 'Applied' },
      { value: '29', label: 'Enrolled' },
    ],
    rows: [
      { title: 'Sara Ahmed · Grade 7 (Prep)', subtitle: 'Walk-in', badge: 'Exam Scheduled', tone: 'amber' },
      { title: 'Omar Karimi · Grade 10 (IGCSE)', subtitle: 'Web', badge: 'Docs Verified', tone: 'indigo' },
      { title: 'Layla Hassan · KG1', subtitle: 'WhatsApp', badge: 'Enrolled ✓', tone: 'emerald' },
      { title: 'Yusuf Rahimi · Grade 4', subtitle: 'Web', badge: 'Waitlist #2', tone: 'slate' },
    ],
    footer: '📈 Conversion rate: 45.3% — Auto-enrolled into Section & Invoice triggered',
  },
  {
    id: 'grades',
    label: 'Classes, Timetable & Grades',
    headline: 'Every stage. Every stream. Perfectly structured.',
    copy: 'Supports Kindergarten rubrics, Elementary standards + numeric, Preparatory weighted marks, and Secondary GPA / letter grades. Conflict-free timetable solver and smart substitute assignment.',
    widgetTitle: 'Grade Book · 8A · Physics · Term 2',
    kpis: [
      { value: '74%', label: 'Class Avg' },
      { value: '32', label: 'Graded' },
      { value: '3', label: 'At Risk' },
    ],
    rows: [
      { title: 'Ahmad Karimi', subtitle: 'Rank #1', badge: '92% (A*)', tone: 'emerald' },
      { title: 'Sara Mohammadi', subtitle: 'Good', badge: '78% (B+)', tone: 'indigo' },
      { title: 'Layla Rahimi', subtitle: 'Needs support', badge: '61% (C)', tone: 'amber' },
      { title: 'Omar Safi', subtitle: 'At risk', badge: '48% (F)', tone: 'rose' },
    ],
    footer: '✦ Early warning flagged Omar & 2 others — Academic Coordinator notified',
  },
  {
    id: 'attendance',
    label: 'Attendance & Biometrics',
    headline: 'Know who arrived. The moment they did.',
    copy: 'Daily roll call (KG/Elementary) and period-wise tracking (Prep/Secondary). HMAC webhooks from ZKTeco & RFID gates, offline mobile sync, BullMQ parent alerts.',
    widgetTitle: 'Attendance · Grade 8A · 8:05 AM',
    kpis: [
      { value: '29', label: 'Present' },
      { value: '3', label: 'Absent' },
      { value: '2', label: 'Late' },
    ],
    rows: [
      { title: 'Ahmad Karimi', subtitle: '7:58 AM', badge: '✓ Biometric / RFID', tone: 'emerald' },
      { title: 'Sara Mohammadi', subtitle: 'Parent notified via WhatsApp', badge: 'Absent', tone: 'rose' },
      { title: 'Layla Rahimi', subtitle: '8:17 AM', badge: 'Late (17m)', tone: 'amber' },
      { title: 'Omar Safi', subtitle: '8:02 AM', badge: '✓ Mobile Roll Call', tone: 'emerald' },
    ],
    footer: '📲 3 parent Push & WhatsApp notifications dispatched via BullMQ',
  },
  {
    id: 'finance',
    label: 'Finance & Online Fees',
    headline: 'Fees collected online. Overdue chased automatically.',
    copy: 'Multi-dimensional fee structures, sibling discounts, scholarships, installment plans, card/wallet/Fawry webhooks, and optional financial hold on report cards.',
    widgetTitle: 'Finance Overview · Term 2 · 2026',
    kpis: [
      { value: '87%', label: 'Collected' },
      { value: '$18.2k', label: 'Outstanding' },
      { value: '41', label: 'Reminders' },
    ],
    rows: [
      { title: 'KG & Primary (G1–6)', subtitle: 'Progress', badge: '94% collected', tone: 'emerald' },
      { title: 'Preparatory (G7–9)', subtitle: 'Progress', badge: '88% collected', tone: 'indigo' },
      { title: 'Secondary (G10–12)', subtitle: 'Progress', badge: '79% collected', tone: 'amber' },
    ],
    footer: '💳 Sibling discounts & installment ledgers reconciled automatically',
  },
  {
    id: 'hr',
    label: 'HR, Staff & Payroll',
    headline: 'From biometric punch to monthly payslip.',
    copy: 'Contracts, qualification alerts, staff biometric attendance, leave workflows linked to substitute engine, automated payroll with PDF payslips.',
    widgetTitle: 'Staff Leave & Payroll Sync · This Month',
    kpis: [
      { value: '86', label: 'Active Staff' },
      { value: '4', label: 'Leave' },
      { value: '100%', label: 'Payroll' },
    ],
    rows: [
      { title: 'Ms. Roya (Math) · Sick Leave', subtitle: 'Today', badge: '⚡ P3 & P5 → Mr. Ali', tone: 'amber' },
      { title: 'April Payroll Run · 86 Staff', subtitle: 'Biometric hours', badge: 'Calculated', tone: 'emerald' },
    ],
    footer: 'Substitute engine flags uncovered classes before HR approval',
  },
  {
    id: 'comms',
    label: 'Parent & Staff Communication',
    headline: 'Replace group-chat chaos with structured channels.',
    copy: 'Targeted broadcasts, moderated 2-way teacher-parent chat with read receipts, and Teacher Quiet Hours (e.g. 17:00–07:30).',
    widgetTitle: 'Parent Inquiry #1042 · Finance & Academics',
    kpis: [
      { value: '✓✓', label: 'Read 8:14' },
      { value: 'Quiet', label: 'Hours on' },
      { value: '1', label: 'Open' },
    ],
    rows: [
      { title: 'Parent: Fee installment question', subtitle: 'Queued outside quiet hours', badge: 'Shield', tone: 'slate' },
      { title: 'Teacher quick reply', subtitle: 'Suggested by policy templates', badge: 'Ready', tone: 'indigo' },
    ],
    footer: 'Quiet Hours queue non-urgent messages automatically',
  },
  {
    id: 'ops',
    label: 'Transport GPS & Library',
    headline: 'Parents know where the bus is. Always.',
    copy: 'Live GPS with proximity alerts, RFID boarding logs, barcode library checkouts syncing fines to the fee ledger, and campus asset inventory.',
    widgetTitle: 'Route 4 · Live GPS · 7:54 AM',
    kpis: [
      { value: '38', label: 'Students' },
      { value: 'On route', label: 'Status' },
      { value: '3', label: 'Stops left' },
    ],
    rows: [
      { title: 'Stop 2 — Al Amin St', subtitle: 'Arrived 7:48 AM', badge: '12 Boarded', tone: 'emerald' },
      { title: 'Stop 3 — Main Gate', subtitle: 'ETA 7:58 AM', badge: 'Approaching', tone: 'amber' },
      { title: 'Stop 4 — School Campus', subtitle: 'ETA 8:06 AM', badge: 'Pending', tone: 'slate' },
    ],
    footer: '📲 14 parents notified — Stop 3 arriving in 4 min',
  },
  {
    id: 'stages',
    label: 'K-12 Multi-Stage',
    headline: 'One engine configured for every K-12 stage.',
    copy: 'Kindergarten, Elementary, Preparatory, and Secondary (National, IG, American, IB) adapt attendance modes, grading engines, and portal views within the same tenant.',
    widgetTitle: 'Stage Adaptability Matrix',
    kpis: [
      { value: '4', label: 'Stages' },
      { value: 'DAILY', label: 'KG Mode' },
      { value: 'PERIOD', label: 'Sec Mode' },
    ],
    rows: [
      { title: 'Kindergarten', subtitle: 'Roll call + QR dismissal', badge: 'Rubrics', tone: 'emerald' },
      { title: 'Elementary', subtitle: 'Standards + formative', badge: 'Mixed', tone: 'indigo' },
      { title: 'Preparatory', subtitle: 'Weighted numeric', badge: 'Period-wise', tone: 'amber' },
      { title: 'Secondary', subtitle: 'GPA / Letter / Credits', badge: 'Streams', tone: 'indigo' },
    ],
    footer: 'Same PostgreSQL tenant — stage & stream configuration drives UX',
  },
];

export function ModuleShowcaseTabs() {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) || tabs[0];
  const { isDesktop } = useBreakpoint();

  return (
    <View nativeID="product" style={styles.wrap}>
      <Text style={styles.h2}>Eight modules. One operating system.</Text>
      <Text style={styles.p}>Interactive product showcase — live UI widgets, not screenshots.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setActive(t.id)}
            style={[styles.tab, active === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, active === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.split, isDesktop && { flexDirection: 'row' }]}>
        <View style={styles.copy}>
          <Text style={styles.headline}>{tab.headline}</Text>
          <Text style={styles.body}>{tab.copy}</Text>
        </View>
        <MockWidget title={tab.widgetTitle} kpis={tab.kpis} footer={tab.footer}>
          {tab.rows.map((row) => (
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
    gap: 16,
    alignItems: 'center',
  },
  h2: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  p: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  tabs: { gap: 8, paddingVertical: 8 },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: { borderBottomColor: colors.brandPrimary },
  tabText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textMuted },
  tabTextActive: { color: colors.brandPrimary },
  split: {
    width: '100%',
    maxWidth: 1100,
    gap: 28,
    marginTop: 16,
    alignItems: 'center',
  },
  copy: { flex: 1, gap: 12, maxWidth: 480 },
  headline: { fontFamily: fonts.bold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5 },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 24 },
});
