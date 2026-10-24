import { IContext } from '~/connectionResolvers';
import { ISevenxAttendanceItemInput } from '@/attendance/@types/attendance';
import { requireClassAccess, shared, SevenxResolver } from '@/common/auth';

export const sevenxAttendanceMutations: Record<string, SevenxResolver> = {
  sevenxAttendanceMark: shared(
    async (
      _root,
      { classId, date, items }: { classId: string; date: string; items: ISevenxAttendanceItemInput[] },
      context: IContext,
    ) => {
      const { actor } = await requireClassAccess(context, classId, 'teacher');
      const markedBy = actor.kind === 'supervisor' ? actor.userId : actor.member._id;
      return context.models.Attendances.markAttendance(classId, date, items, markedBy);
    },
  ),
};
