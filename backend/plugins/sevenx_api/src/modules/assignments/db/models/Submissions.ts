import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxSubmissionSchema } from '@/assignments/db/definitions/assignments';
import { ISevenxSubmissionDocument } from '@/assignments/@types/assignments';
import { ISevenxAttachment } from '@/common/types';

export interface ISevenxSubmissionModel extends Model<ISevenxSubmissionDocument> {
  getSubmission(_id: string): Promise<ISevenxSubmissionDocument>;
  listByAssignment(assignmentId: string): Promise<ISevenxSubmissionDocument[]>;
  upsertSubmission(
    assignmentId: string,
    studentId: string,
    text?: string,
    attachments?: ISevenxAttachment[],
  ): Promise<ISevenxSubmissionDocument>;
  gradeSubmission(_id: string, score: number, feedback?: string): Promise<ISevenxSubmissionDocument>;
}

export const loadSevenxSubmissionClass = (models: IModels) => {
  class Submission {
    public static async getSubmission(_id: string) {
      const submission = await models.Submissions.findOne({ _id }).lean();
      if (!submission) {
        throw new ExpectedError('Submission not found', 'NOT_FOUND');
      }
      return submission;
    }

    public static async listByAssignment(assignmentId: string) {
      return models.Submissions.find({ assignmentId }).sort({ submittedAt: -1 }).lean();
    }

    public static async upsertSubmission(
      assignmentId: string,
      studentId: string,
      text?: string,
      attachments: ISevenxAttachment[] = [],
    ) {
      if (!text?.trim() && !attachments.length) {
        throw new ExpectedError('Submission needs text or at least one file', 'VALIDATION');
      }
      await models.Assignments.getAssignment(assignmentId);
      const existing = await models.Submissions.findOne({ assignmentId, studentId }).lean();
      if (existing?.gradedAt) {
        throw new ExpectedError('Graded submissions cannot be changed', 'VALIDATION');
      }
      const doc = await models.Submissions.findOneAndUpdate(
        { assignmentId, studentId },
        { $set: { text, attachments, submittedAt: new Date() } },
        { new: true, upsert: true },
      ).lean();
      return doc as ISevenxSubmissionDocument;
    }

    public static async gradeSubmission(_id: string, score: number, feedback?: string) {
      const submission = await models.Submissions.getSubmission(_id);
      const assignment = await models.Assignments.getAssignment(submission.assignmentId);
      if (score < 0 || score > assignment.maxScore) {
        throw new ExpectedError(`Score must be between 0 and ${assignment.maxScore}`, 'VALIDATION');
      }
      return models.Submissions.findOneAndUpdate(
        { _id },
        { $set: { score, feedback, gradedAt: new Date() } },
        { new: true },
      ).lean();
    }
  }

  sevenxSubmissionSchema.loadClass(Submission);
  return sevenxSubmissionSchema;
};
