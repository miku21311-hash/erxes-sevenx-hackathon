import { Suspense, use } from 'react';
import { TeacherClassPage } from '@/modules/teacher/TeacherClassPage';

export default function TeacherClassRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <TeacherClassPage classId={id} />
    </Suspense>
  );
}
