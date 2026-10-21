import { Slot } from 'expo-router';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Slot />
    </DashboardShell>
  );
}
