/**
 * Public student admissions application (FR-SIS-01).
 * This is NOT school registration — parents apply a student to an existing school.
 */

export const admissionsAr = {
  title: 'طلب تقديم قبول لطالب',
  subtitle:
    'هذه الصفحة لأولياء الأمور لتقديم طلب التحاق طالب بمدرسة موجودة مسبقاً على المنصة — وليست لإنشاء مدرسة جديدة. يتم التحقق من عمر القبول حسب تاريخ 1 أكتوبر المعتمد لدى المدرسة.',
  notice:
    'لإنشاء مدرسة جديدة أو حساب إدارة: يدخل مشرف المنصة أولاً من «دخول البوابة»، ثم ينشئ المستأجر (المدرسة) وفرعها ومديرها.',
  tenantLabel: 'كود المدرسة (المعرّف)',
  tenantHint: 'مثال: demo-school — تحصل عليه من إدارة المدرسة',
  nameLabel: 'الاسم الكامل للمتقدم',
  dobLabel: 'تاريخ الميلاد (YYYY-MM-DD) — KG1 تقريباً 3.5–5.5 سنوات حتى 1 أكتوبر',
  branchLabel: 'معرّف الفرع (من إدارة المدرسة)',
  yearLabel: 'معرّف العام الدراسي',
  gradeLabel: 'معرّف الصف المطلوب',
  guardianNameLabel: 'اسم ولي الأمر',
  guardianPhoneLabel: 'هاتف ولي الأمر',
  submit: 'إرسال طلب القبول',
  submitting: 'جارٍ الإرسال…',
  success: (id: string, status: string) => `تم إرسال الطلب — الرقم ${id} (الحالة: ${status})`,
  failed: 'تعذّر إرسال الطلب',
  back: 'العودة للموقع',
} as const;
