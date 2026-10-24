import { IContext } from '~/connectionResolvers';
import { ISevenxClassInput } from '@/classes/@types/classes';
import { ISevenxClassFilter } from '@/classes/db/models/Classes';
import { portal, requireClassAccess, requireMember, shared, SevenxResolver } from '@/common/auth';
import { generateSessions, todayString } from '@/common/schedule';

export const sevenxClassQueries: Record<string, SevenxResolver> = {
  sevenxClasses: async (_root, filter: ISevenxClassFilter, { models }: IContext) =>
    models.Classes.listClasses(filter),

  sevenxClassDetail: shared(async (_root, { _id }: { _id: string }, context: IContext) => {
    const { cls } = await requireClassAccess(context, _id);
    return cls;
  }),

  sevenxScheduleConflicts: async (
    _root,
    { input, excludeClassId }: { input: ISevenxClassInput; excludeClassId?: string },
    { models }: IContext,
  ) => models.Classes.findConflicts(input, excludeClassId),

  sevenxMyClasses: portal(async (_root, _args, context: IContext) => {
    const member = await requireMember(context);
    return await context.models.Classes.find({
      status: 'active',
      $or: [{ teacherId: member._id }, { studentIds: member._id }],
    })
      .sort({ name: 1 })
      .lean();
  }),

  sevenxClassSessions: shared(
    async (
      _root,
      { classId, from, to }: { classId: string; from?: string; to?: string },
      context: IContext,
    ) => {
      const { cls } = await requireClassAccess(context, classId);
      return generateSessions(cls.schedule, from, to);
    },
  ),

  sevenxDashboardStats: async (_root, _args, { models }: IContext) => {
    const [teacherCount, studentCount, classCount, locationCount, pendingInvites, classes] =
      await Promise.all([
        models.Members.countDocuments({ role: 'teacher' }),
        models.Members.countDocuments({ role: 'student' }),
        models.Classes.countDocuments({ status: 'active' }),
        models.Locations.countDocuments({}),
        models.Invites.countDocuments({ acceptedAt: { $exists: false }, expiresAt: { $gt: new Date() } }),
        models.Classes.find({ status: 'active' }).lean(),
      ]);

    const today = todayString();
    const todaySessions = classes.filter(
      (c) => generateSessions(c.schedule, today, today).length > 0,
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const from = weekAgo.toISOString().slice(0, 10);
    let expected = 0;
    for (const c of classes) {
      const past = generateSessions(c.schedule, from, today).filter((s) => s.isPast).length;
      expected += past * c.studentIds.length;
    }
    const attended = await models.Attendances.countDocuments({
      date: { $gte: from, $lte: today },
      status: { $in: ['present', 'late'] },
    });
    // Fraction 0..1, same convention as SevenxAttendanceSummary.rate.
    const weeklyAttendanceRate =
      expected > 0 ? Math.min(1, Math.round((attended / expected) * 1000) / 1000) : 0;

    return {
      teacherCount,
      studentCount,
      classCount,
      locationCount,
      todaySessions,
      weeklyAttendanceRate,
      pendingInvites,
    };
  },
};
