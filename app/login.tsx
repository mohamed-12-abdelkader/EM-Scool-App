import { Redirect } from 'expo-router';

/** Legacy route — use Clast-style sign-in */
export default function LoginRedirect() {
  return <Redirect href="/(auth)/signin" />;
}
