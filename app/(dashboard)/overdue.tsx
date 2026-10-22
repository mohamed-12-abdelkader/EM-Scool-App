import { Redirect } from 'expo-router';

/** Overdue installments — filtered list in installments module */
export default function OverdueRedirect() {
  return <Redirect href="/installments" />;
}
