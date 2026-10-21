import { ModuleListPage } from '@/components/modules/ModuleListPage';

export default function Page() {
  return (
    <ModuleListPage
      title="المصروفات الدراسية"
      subtitle="تعريف الرسوم حسب الصف والعام"
      group="المالية والحسابات"
      type="generic"
      entity="خطط الرسوم"
    />
  );
}
