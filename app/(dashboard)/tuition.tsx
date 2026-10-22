import { Redirect } from 'expo-router';

/** Tuition product lives in the finance hub */
export default function TuitionRedirect() {
  return <Redirect href="/finance" />;
}
