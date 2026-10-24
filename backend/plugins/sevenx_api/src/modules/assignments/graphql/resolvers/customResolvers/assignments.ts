import { IContext } from '~/connectionResolvers';
import {
  ISevenxAssignmentDocument,
  ISevenxSubmissionDocument,
} from '@/assignments/@types/assignments';

export const SevenxAssignment = {
  async submissionCount(assignment: ISevenxAssignmentDocument, _args: unknown, { models }: IContext) {
    return await models.Submissions.countDocuments({ assignmentId: assignment._id });
  },
  async gradedCount(assignment: ISevenxAssignmentDocument, _args: unknown, { models }: IContext) {
    return await models.Submissions.countDocuments({
      assignmentId: assignment._id,
      gradedAt: { $exists: true },
    });
  },
  async mySubmission(assignment: ISevenxAssignmentDocument, _args: unknown, { models, cpUser }: IContext) {
    if (!cpUser?._id) {
      return null;
    }
    const member = await models.Members.getMemberByCpUser(cpUser._id);
    if (!member || member.role !== 'student') {
      return null;
    }
    return await models.Submissions.findOne({ assignmentId: assignment._id, studentId: member._id }).lean();
  },
};

export const SevenxSubmission = {
  async student(submission: ISevenxSubmissionDocument, _args: unknown, { models }: IContext) {
    return await models.Members.findOne({ _id: submission.studentId }).lean();
  },
  async isLate(submission: ISevenxSubmissionDocument, _args: unknown, { models }: IContext) {
    const assignment = await models.Assignments.findOne({ _id: submission.assignmentId }).lean();
    if (!assignment) {
      return false;
    }
    return new Date(submission.submittedAt) > new Date(assignment.dueDate);
  },
};
