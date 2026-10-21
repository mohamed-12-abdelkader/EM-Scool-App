import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { roleHome, useAuth } from '@/lib/auth';
import { colors } from '@/theme/tokens';

/** Unauthenticated → public landing; authenticated → role portal */
export default function Index() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCanvas }}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }
  if (!user) return <Redirect href={'/(public)' as never} />;
  return <Redirect href={roleHome(user.role) as never} />;
}
