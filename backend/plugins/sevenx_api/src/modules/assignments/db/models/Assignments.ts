import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxAssignmentSchema } from '@/assignments/db/definitions/assignments';
import {
  ISevenxAssignmentDocument,
  ISevenxAssignmentInput,
} from '@/assignments/@types/assignments';

export interface ISevenxAssignmentModel extends Model<ISevenxAssignmentDocument> {
  getAssignment(_id: string): Promise<ISevenxAssignmentDocument>;
  listByClass(classId: string): Promise<ISevenxAssignmentDocument[]>;
  createAssignment(input: ISevenxAssignmentInput, createdBy: string): Promise<ISevenxAssignmentDocument>;
  updateAssignment(_id: string, input: ISevenxAssignmentInput): Promise<ISevenxAssignmentDocument>;
  removeAssignment(_id: string): Promise<string>;
}

const validate = (input: ISevenxAssignmentInput) => {
  if (!input.title?.trim()) {
    throw new ExpectedError('Assignment title is required', 'VALIDATION');
  }
  if (!input.dueDate || Number.isNaN(new Date(input.dueDate).getTime())) {
    throw new ExpectedError('Valid dueDate is required', 'VALIDATION');
  }
  if (input.maxScore !== undefined && (input.maxScore <= 0 || input.maxScore > 1000)) {
    throw new ExpectedError('maxScore must be between 1 and 1000', 'VALIDATION');
  }
};

export const loadSevenxAssignmentClass = (models: IModels) => {
  class Assignment {
    public static async getAssignment(_id: string) {
      const assignment = await models.Assignments.findOne({ _id }).lean();
      if (!assignment) {
        throw new ExpectedError('Assignment not found', 'NOT_FOUND');
      }
      return assignment;
    }

    public static async listByClass(classId: string) {
      return models.Assignments.find({ classId }).sort({ dueDate: -1 }).lean();
    }

    public static async createAssignment(input: ISevenxAssignmentInput, createdBy: string) {
      validate(input);
      await models.Classes.getClass(input.classId);
      return models.Assignments.create({
        ...input,
        attachments: input.attachments || [],
        maxScore: input.maxScore ?? 100,
        createdBy,
      });
    }

    public static async updateAssignment(_id: string, input: ISevenxAssignmentInput) {
      validate(input);
      const existing = await models.Assignments.getAssignment(_id);
      if (existing.classId !== input.classId) {
        throw new ExpectedError('Assignment cannot be moved to another class', 'VALIDATION');
      }
      return models.Assignments.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...input,
            attachments: input.attachments || [],
            maxScore: input.maxScore ?? existing.maxScore,
          },
        },
        { new: true },
      ).lean();
    }

    public static async removeAssignment(_id: string) {
      await models.Assignments.getAssignment(_id);
      await models.Submissions.deleteMany({ assignmentId: _id });
      await models.Assignments.deleteOne({ _id });
      return _id;
    }
  }

  sevenxAssignmentSchema.loadClass(Assignment);
  return sevenxAssignmentSchema;
};
