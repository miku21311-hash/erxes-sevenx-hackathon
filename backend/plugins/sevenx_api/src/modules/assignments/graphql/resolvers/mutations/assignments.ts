import { IContext } from '~/connectionResolvers';
import { ISevenxAssignmentInput } from '@/assignments/@types/assignments';
import { ISevenxAttachment } from '@/common/types';
import { portal, requireClassAccess, requireMember, shared, SevenxResolver } from '@/common/auth';

export const sevenxAssignmentMutations: Record<string, SevenxResolver> = {
  sevenxAssignmentAdd: shared(
    async (_root, { input }: { input: ISevenxAssignmentInput }, context: IContext) => {
      const { actor } = await requireClassAccess(context, input.classId, 'teacher');
      const createdBy = actor.kind === 'supervisor' ? actor.userId : actor.member._id;
      return context.models.Assignments.createAssignment(input, createdBy);
    },
  ),

  sevenxAssignmentEdit: shared(
    async (_root, { _id, input }: { _id: string; input: ISevenxAssignmentInput }, context: IContext) => {
      const existing = await context.models.Assignments.getAssignment(_id);
      await requireClassAccess(context, existing.classId, 'teacher');
      return context.models.Assignments.updateAssignment(_id, input);
    },
  ),

  sevenxAssignmentRemove: shared(async (_root, { _id }: { _id: string }, context: IContext) => {
    const existing = await context.models.Assignments.getAssignment(_id);
    await requireClassAccess(context, existing.classId, 'teacher');
    return context.models.Assignments.removeAssignment(_id);
  }),

  sevenxSubmissionUpsert: portal(
    async (
      _root,
      { assignmentId, text, attachments }: { assignmentId: string; text?: string; attachments?: ISevenxAttachment[] },
      context: IContext,
    ) => {
      const member = await requireMember(context, 'student');
      const assignment = await context.models.Assignments.getAssignment(assignmentId);
      await requireClassAccess(context, assignment.classId);
      return context.models.Submissions.upsertSubmission(assignmentId, member._id, text, attachments || []);
    },
  ),

  sevenxSubmissionGrade: shared(
    async (_root, { _id, score, feedback }: { _id: string; score: number; feedback?: string }, context: IContext) => {
      const submission = await context.models.Submissions.getSubmission(_id);
      const assignment = await context.models.Assignments.getAssignment(submission.assignmentId);
      await requireClassAccess(context, assignment.classId, 'teacher');
      return context.models.Submissions.gradeSubmission(_id, score, feedback);
    },
  ),
};
