import { Suspense, use } from 'react';
import { StudentClassPage } from '@/modules/student/StudentClassPage';

export default function StudentClassRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <StudentClassPage classId={id} />
    </Suspense>
  );
}
