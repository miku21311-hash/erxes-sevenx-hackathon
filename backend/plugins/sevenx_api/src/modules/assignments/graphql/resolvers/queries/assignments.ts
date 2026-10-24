import { IContext } from '~/connectionResolvers';
import { requireClassAccess, shared, SevenxResolver } from '@/common/auth';

export const sevenxAssignmentQueries: Record<string, SevenxResolver> = {
  sevenxAssignments: shared(async (_root, { classId }: { classId: string }, context: IContext) => {
    await requireClassAccess(context, classId);
    return context.models.Assignments.listByClass(classId);
  }),

  sevenxAssignmentDetail: shared(async (_root, { _id }: { _id: string }, context: IContext) => {
    const assignment = await context.models.Assignments.getAssignment(_id);
    await requireClassAccess(context, assignment.classId);
    return assignment;
  }),

  sevenxSubmissions: shared(
    async (_root, { assignmentId }: { assignmentId: string }, context: IContext) => {
      const assignment = await context.models.Assignments.getAssignment(assignmentId);
      await requireClassAccess(context, assignment.classId, 'teacher');
      return context.models.Submissions.listByAssignment(assignmentId);
    },
  ),
};
