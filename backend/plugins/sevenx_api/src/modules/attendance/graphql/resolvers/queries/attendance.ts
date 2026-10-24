import { IContext } from '~/connectionResolvers';
import { portal, requireClassAccess, requireMember, shared, SevenxResolver } from '@/common/auth';

export const sevenxAttendanceQueries: Record<string, SevenxResolver> = {
  sevenxAttendanceReport: shared(
    async (
      _root,
      { classId, from, to }: { classId: string; from?: string; to?: string },
      context: IContext,
    ) => {
      await requireClassAccess(context, classId, 'teacher');
      return context.models.Attendances.listByClass(classId, from, to);
    },
  ),

  sevenxAttendanceByDate: shared(
    async (_root, { classId, date }: { classId: string; date: string }, context: IContext) => {
      const { cls } = await requireClassAccess(context, classId, 'teacher');
      const rows = await context.models.Attendances.find({ classId, date }).lean();
      const byStudent = new Map(rows.map((r) => [r.studentId, r]));
      return cls.studentIds.map(
        (studentId) =>
          byStudent.get(studentId) || {
            _id: '',
            classId,
            date,
            studentId,
            status: 'absent',
          },
      );
    },
  ),

  sevenxMyAttendance: portal(async (_root, { classId }: { classId: string }, context: IContext) => {
    const member = await requireMember(context, 'student');
    await requireClassAccess(context, classId);
    return await context.models.Attendances
      .find({ classId, studentId: member._id })
      .sort({ date: -1 })
      .lean();
  }),

  sevenxMyAttendanceSummary: portal(
    async (_root, { classId }: { classId: string }, context: IContext) => {
      const member = await requireMember(context, 'student');
      await requireClassAccess(context, classId);
      const [summary] = await context.models.Attendances.summarize(classId, [member._id]);
      return summary;
    },
  ),

  sevenxClassAttendanceSummary: shared(
    async (_root, { classId }: { classId: string }, context: IContext) => {
      const { cls } = await requireClassAccess(context, classId, 'teacher');
      return context.models.Attendances.summarize(classId, cls.studentIds);
    },
  ),
};
