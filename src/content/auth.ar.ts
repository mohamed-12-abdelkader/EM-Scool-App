/** Arabic copy for sign-in / login (ar-EG) */

export type DemoLogin = {
  label: string;
  email: string;
  password: string;
  role?: string;
  tenantSlug?: string;
};

export const authAr = {
  back: 'العودة للموقع',
  brandSub: 'سجّل الدخول إلى بوابة مدرستك',
  tenantLabel: 'كود المدرسة أو النطاق الفرعي',
  tenantPlaceholder: 'مثال: demo-school',
  identifierLabel: 'البريد أو كود الطالب أو رقم الهاتف',
  identifierPlaceholder: 'admin@demo-school.local',
  password: 'كلمة المرور',
  forgot: 'نسيت كلمة المرور؟',
  showPassword: 'إظهار كلمة المرور',
  hidePassword: 'إخفاء كلمة المرور',
  remember: 'إبقني متصلاً على هذا الجهاز لمدة 30 يوماً',
  submit: 'دخول البوابة',
  submitting: 'جارٍ تسجيل الدخول…',
  failed: 'فشل تسجيل الدخول',
  demoToggle: 'تبديل حسابات تجريبية',
  helpApply: 'تحتاج تقديم قبول لطالب؟ قدّم أونلاين',
  secure: 'بيانات كل مدرسة معزولة. الدخول حسب الدور والصلاحيات.',
  roleTabs: ['طاقم / إدارة', 'معلم', 'ولي أمر', 'طالب'] as const,
  demoLogins: [
    {
      label: 'مشرف المنصة',
      email: 'admin@emschool.local',
      password: 'admin123456',
      role: 'PLATFORM_SUPER_ADMIN',
      tenantSlug: '',
    },
    {
      label: 'إدارة المدرسة',
      email: 'admin@demo-school.local',
      password: 'admin123456',
      role: 'SCHOOL_ADMIN',
      tenantSlug: 'demo-school',
    },
    {
      label: 'معلم',
      email: 'teacher@demo-school.local',
      password: 'admin123456',
      role: 'TEACHER',
      tenantSlug: 'demo-school',
    },
    {
      label: 'ولي أمر',
      email: 'parent-demo-1792688052@example.com',
      password: 'admin123456',
      role: 'PARENT',
      tenantSlug: 'demo-school',
    },
  ] satisfies DemoLogin[],
  showcaseBadge: 'منصة مدارس متعددة المستأجرين',
  showcaseTitle: 'من قبول الطالب حتى متابعة الحضور والرسوم — في بوابة واحدة',
  floatTitle: 'معاينة تشغيل المدرسة',
  floatKpis: [
    { value: '96%', label: 'حضور' },
    { value: '87%', label: 'رسوم' },
    { value: '4', label: 'مراحل' },
  ],
  floatFooter: 'مزامنة الحضور والرسوم من بوابات الإدارة والمعلم',
  floatRowTitle: 'تحصيل الترم',
  floatRowSub: 'متابعة المستحقات من الإدارة',
  floatLive: 'مباشر',
  alertTitle: 'تنبيهات ولي الأمر',
  alertBus: 'أتوبيس الخط 4 يقترب من المحطة (خلال دقائق)',
  alertGate: 'تم تسجيل حضور ليلى (KG2) من البوابة',
  testimonial:
    'ملف واحد للطالب من القبول حتى التخرج، مع بوابات منفصلة للإدارة والمعلم وولي الأمر.',
  streams: ['وطني', 'IGCSE', 'أمريكي', 'IB'],
} as const;
