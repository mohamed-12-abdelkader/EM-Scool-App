import type { NavGroup } from '@/types';

/** Primary nav — keep short so the ERP stays easy to scan */
export const navGroups: NavGroup[] = [
  {
    title: 'الأساسيات',
    items: [
      { label: 'لوحة التحكم', href: '/', icon: 'LayoutDashboard' },
      { label: 'الرسوم والأقساط', href: '/finance', icon: 'Wallet' },
      { label: 'الأقساط', href: '/installments', icon: 'Receipt' },
      { label: 'الجدول المدرسي', href: '/timetable', icon: 'CalendarClock' },
      { label: 'مسار القبول', href: '/admissions', icon: 'UserPlus' },
      { label: 'الطلاب', href: '/students', icon: 'GraduationCap' },
      { label: 'الحضور', href: '/attendance', icon: 'ClipboardCheck' },
    ],
  },
  {
    title: 'أكاديمي',
    items: [
      { label: 'المواد', href: '/subjects', icon: 'BookOpen' },
      { label: 'الفصول', href: '/classes', icon: 'School' },
      { label: 'الصفوف', href: '/grades', icon: 'Layers' },
      { label: 'المدرسون', href: '/teachers', icon: 'Users' },
      { label: 'التقويم', href: '/calendar', icon: 'CalendarDays' },
    ],
  },
  {
    title: 'المزيد',
    items: [
      { label: 'التقارير', href: '/reports', icon: 'BarChart3' },
      { label: 'أولياء الأمور', href: '/parents', icon: 'Contact' },
      { label: 'الإشعارات', href: '/notifications', icon: 'Bell' },
      { label: 'الموظفون', href: '/employees', icon: 'Briefcase' },
      { label: 'الإعدادات', href: '/settings', icon: 'Settings' },
    ],
  },
];

export const academicYears = ['2025 / 2026', '2024 / 2025', '2023 / 2024'];
export const schoolName = 'Clast';
export const currentUser = {
  name: 'مدير المدرسة',
  role: 'إدارة المدرسة',
  email: '',
};
