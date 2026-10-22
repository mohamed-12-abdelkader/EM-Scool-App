import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Navbar,
  HeroSection,
  RoleDashboardSwitcher,
  BeforeAfterSection,
  ModuleShowcaseTabs,
  GuideComparisonSection,
  IntegrationsAndFooter,
  LandingScrollShell,
  LandingSection,
  useLandingScroll,
} from '@/components/marketing';
import { colors } from '@/theme/tokens';

function LandingBody() {
  const { scrollTo } = useLandingScroll();
  const params = useLocalSearchParams<{ section?: string | string[] }>();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;

  useEffect(() => {
    if (!section) return;
    const timer = setTimeout(() => scrollTo(section), 120);
    return () => clearTimeout(timer);
  }, [section, scrollTo]);

  return (
    <>
      <LandingSection id="top">
        <HeroSection />
      </LandingSection>

      <LandingSection id="roles">
        <RoleDashboardSwitcher />
      </LandingSection>

      <LandingSection id="solutions">
        <BeforeAfterSection />
      </LandingSection>

      <LandingSection id="product" ids={['stages']}>
        <ModuleShowcaseTabs />
      </LandingSection>

      <LandingSection id="guide">
        <GuideComparisonSection />
      </LandingSection>

      <LandingSection id="pricing">
        <IntegrationsAndFooter />
      </LandingSection>
    </>
  );
}

/** One-page landing — navbar scrolls to sections. */
export default function LandingPage() {
  return (
    <View style={styles.root}>
      <LandingScrollShell navbar={<Navbar />}>
        <LandingBody />
      </LandingScrollShell>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
});
