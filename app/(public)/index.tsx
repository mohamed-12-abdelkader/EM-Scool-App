import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Navbar,
  HeroSection,
  RoleDashboardSwitcher,
  BeforeAfterSection,
  ModuleShowcaseTabs,
  GuideComparisonSection,
  IntegrationsAndFooter,
} from '@/components/marketing';
import { colors } from '@/theme/tokens';

export default function LandingPage() {
  return (
    <View style={styles.root}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <HeroSection />
        <RoleDashboardSwitcher />
        <BeforeAfterSection />
        <ModuleShowcaseTabs />
        <GuideComparisonSection />
        <IntegrationsAndFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas, direction: 'ltr' },
  scroll: { paddingBottom: 0 },
});
