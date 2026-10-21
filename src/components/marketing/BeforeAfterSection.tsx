import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const before = [
  'Attendance registers on paper — reconciled manually at week end.',
  'Fees tracked in Excel, reminders sent one by one via personal WhatsApp.',
  'Parents find out about absences at school pick-up.',
  'Report cards typed, printed, signed, and distributed manually.',
  'Admission enquiries logged in a notebook — waitlists fall through cracks.',
  'No visibility on at-risk students until final exam results arrive.',
];

const after = [
  'Biometric, RFID, or QR attendance — live dashboard, parent notified in seconds.',
  'Multi-tier fees with sibling discounts, paid online, overdue chased on schedule.',
  'Parents see attendance, grades, and live GPS bus location every day.',
  'Tamper-evident PDF report cards & GPA transcripts in one click.',
  'Every enquiry captured, exam scheduled, converted through a waitlist pipeline.',
  'Early warning flags at-risk students from attendance dips and quiz scores.',
];

export function BeforeAfterSection() {
  const { isDesktop } = useBreakpoint();
  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>Run your school without the chaos.</Text>
      <View style={[styles.grid, isDesktop && { flexDirection: 'row' }]}>
        <View style={[styles.col, styles.before, shadows.card]}>
          <Text style={styles.colTitle}>Before — Disconnected Spreadsheets & Paper</Text>
          {before.map((t) => (
            <Text key={t} style={styles.item}>
              <Text style={{ color: colors.statusDanger }}>✕ </Text>
              {t}
            </Text>
          ))}
        </View>
        <View style={[styles.col, styles.after, shadows.card]}>
          <Text style={styles.colTitle}>After — Unified K-12 OS</Text>
          {after.map((t) => (
            <Text key={t} style={styles.item}>
              <Text style={{ color: colors.statusSuccess }}>✓ </Text>
              {t}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgCanvas,
    gap: 28,
    alignItems: 'center',
  },
  h2: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  grid: { width: '100%', maxWidth: 1100, gap: 16 },
  col: {
    flex: 1,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    padding: 24,
    gap: 12,
    backgroundColor: colors.bgSurface,
  },
  before: { borderColor: '#FECDD3' },
  after: { borderColor: '#C7D2FE' },
  colTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary, marginBottom: 4 },
  item: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
