import { Redirect } from 'expo-router';

/** School admin lands on unified ERP dashboard */
export default function SchoolAdminHome() {
  return <Redirect href="/(dashboard)" />;
}
