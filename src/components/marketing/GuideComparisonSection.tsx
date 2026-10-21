import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

const matrix = [
  {
    name: 'SIS',
    full: 'Student Information System',
    desc: '360° student records, family sibling graph, medical clinic log, admissions vault.',
  },
  {
    name: 'LMS',
    full: 'Learning Management System',
    desc: 'Syllabus pacing, digital homework, student uploads, multi-scale gradebook.',
  },
  {
    name: 'SMS',
    full: 'School Management System',
    desc: 'Biometric/RFID attendance, conflict-free timetables, parent-teacher chat, bus GPS.',
  },
  {
    name: 'ERP',
    full: 'Enterprise Resource Planning',
    desc: 'Fee billing, payment webhooks, HR contracts, payroll, library & asset inventory.',
  },
];

const workflows = [
  {
    title: 'Student Enrollment',
    steps: 'Online Form → Entrance Exam → Waitlist → Student + Family Profile & Enrollment Invoice',
  },
  {
    title: 'Daily Attendance',
    steps: 'Mobile Roll Call / RFID → BullMQ Job → Parent Push/WhatsApp → Compliance sync',
  },
  {
    title: 'Fee Collection',
    steps: 'Bulk Invoice → Parent Pays in App → HMAC Webhook → Ledger PAID + PDF Receipt',
  },
];

export function GuideComparisonSection() {
  return (
    <View nativeID="guide" style={styles.wrap}>
      <Text style={styles.h2}>The Complete 2026 Guide</Text>
      <Text style={styles.p}>
        Traditional vendors force schools to buy 4 separate tools. We unify SMS + SIS + LMS + ERP in one
        PostgreSQL multi-tenant schema.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {matrix.map((m) => (
          <View key={m.name} style={[styles.card, shadows.card]}>
            <Text style={styles.cardName}>{m.name}</Text>
            <Text style={styles.cardFull}>{m.full}</Text>
            <Text style={styles.cardDesc}>{m.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.h3}>3 live workflows</Text>
      <View style={styles.flowRow}>
        {workflows.map((w, i) => (
          <View key={w.title} style={[styles.flow, shadows.sm]}>
            <Text style={styles.flowN}>{i + 1}</Text>
            <Text style={styles.flowTitle}>{w.title}</Text>
            <Text style={styles.flowSteps}>{w.steps}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgCanvas,
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
  p: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 720,
    lineHeight: 24,
    marginBottom: 8,
  },
  cards: { gap: 12, paddingVertical: 8 },
  card: {
    width: 260,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 8,
  },
  cardName: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.brandPrimary },
  cardFull: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  cardDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  h3: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 24,
    alignSelf: 'center',
  },
  flowRow: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  flow: {
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 8,
  },
  flowN: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  flowTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  flowSteps: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
