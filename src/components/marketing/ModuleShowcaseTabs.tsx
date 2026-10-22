import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AnimatedProgressBar } from '@/components/ui/AnimatedProgressBar';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { PillBadge } from './Badge';
import { MockWidget, MockRow } from './MockWidget';
import { landingAr } from '@/content/landing.ar';
import { arFonts, colors, MOTION } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const tabs = landingAr.modules.tabs;

export function ModuleShowcaseTabs() {
  const [active, setActive] = useState<string>(tabs[0].id);
  const tab = tabs.find((item) => item.id === active) || tabs[0];
  const { isDesktop } = useBreakpoint();
  const reduced = useReducedMotion();

  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>{landingAr.modules.title}</Text>
      <Text style={styles.p}>{landingAr.modules.subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((item) => (
          <AnimatedPressable
            key={item.id}
            onPress={() => setActive(item.id)}
            style={[styles.tab, active === item.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, active === item.id && styles.tabTextActive]}>{item.label}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <Animated.View
        key={tab.id}
        entering={reduced ? undefined : FadeInDown.duration(MOTION.tabEnterMs).springify()}
        style={[styles.split, isDesktop && { flexDirection: 'row' }]}
      >
        <View style={styles.copy}>
          <Text style={styles.headline}>{tab.headline}</Text>
          <Text style={styles.body}>{tab.copy}</Text>
        </View>
        <MockWidget
          title={tab.widgetTitle}
          kpis={[...tab.kpis]}
          footer={tab.footer}
          contentKey={tab.id}
        >
          {tab.id === 'attendance' ? (
            <View style={styles.liveRow}>
              <LivePulseDot color={colors.statusSuccess} size={10} />
              <Text style={styles.liveText}>بث حي · آخر مزامنة للحضور</Text>
            </View>
          ) : null}
          {'progress' in tab && tab.progress
            ? tab.progress.map((bar) => (
                <AnimatedProgressBar
                  key={bar.label}
                  label={bar.label}
                  progress={bar.value}
                  fillColor={bar.color}
                />
              ))
            : null}
          {tab.rows.map((row, index) => (
            <MockRow
              key={row.title}
              index={index}
              title={row.title}
              subtitle={row.subtitle}
              right={<PillBadge label={row.badge} tone={row.tone} />}
            />
          ))}
        </MockWidget>
      </Animated.View>
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
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  p: {
    fontFamily: arFonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 720,
  },
  tabs: { gap: 8, paddingVertical: 8 },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: { borderBottomColor: colors.brandPrimary },
  tabText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textMuted },
  tabTextActive: { color: colors.brandPrimary },
  split: {
    width: '100%',
    maxWidth: 1100,
    gap: 28,
    marginTop: 16,
    alignItems: 'center',
  },
  copy: { flex: 1, gap: 12, maxWidth: 480 },
  headline: {
    fontFamily: arFonts.bold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 34,
  },
  body: {
    fontFamily: arFonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 26,
    textAlign: 'right',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingVertical: 6,
  },
  liveText: { fontFamily: arFonts.medium, fontSize: 12, color: colors.statusSuccess },
});
