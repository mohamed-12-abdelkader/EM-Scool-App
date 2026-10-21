import { Tabs } from 'expo-router';

export default function SchoolAdminLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'لوحة التحكم' }} />
      <Tabs.Screen name="admissions" options={{ title: 'القبول' }} />
      <Tabs.Screen name="students" options={{ title: 'الطلاب' }} />
      <Tabs.Screen name="student/[id]" options={{ href: null, title: 'ملف الطالب' }} />
    </Tabs>
  );
}
