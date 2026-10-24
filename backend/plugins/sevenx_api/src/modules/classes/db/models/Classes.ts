import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxClassSchema } from '@/classes/db/definitions/classes';
import {
  ISevenxClassDocument,
  ISevenxClassInput,
  ISevenxScheduleConflict,
} from '@/classes/@types/classes';
import { schedulesOverlap, validateSchedule } from '@/common/schedule';

export interface ISevenxClassFilter {
  locationId?: string;
  teacherId?: string;
  searchValue?: string;
  status?: string;
}

export interface ISevenxClassModel extends Model<ISevenxClassDocument> {
  getClass(_id: string): Promise<ISevenxClassDocument>;
  listClasses(filter: ISevenxClassFilter): Promise<ISevenxClassDocument[]>;
  findConflicts(input: ISevenxClassInput, excludeClassId?: string): Promise<ISevenxScheduleConflict[]>;
  createClass(input: ISevenxClassInput): Promise<ISevenxClassDocument>;
  updateClass(_id: string, input: ISevenxClassInput): Promise<ISevenxClassDocument>;
  removeClass(_id: string): Promise<string>;
  addStudents(_id: string, studentIds: string[]): Promise<ISevenxClassDocument>;
  removeStudent(_id: string, studentId: string): Promise<ISevenxClassDocument>;
}

export const loadSevenxClassClass = (models: IModels) => {
  class Class {
    public static async getClass(_id: string) {
      const cls = await models.Classes.findOne({ _id }).lean();
      if (!cls) {
        throw new ExpectedError('Class not found', 'NOT_FOUND');
      }
      return cls;
    }

    public static async listClasses(filter: ISevenxClassFilter) {
      const query: Record<string, unknown> = {};
      if (filter.locationId) query.locationId = filter.locationId;
      if (filter.teacherId) query.teacherId = filter.teacherId;
      if (filter.status) query.status = filter.status;
      if (filter.searchValue) {
        query.name = new RegExp(filter.searchValue.trim(), 'i');
      }
      return models.Classes.find(query).sort({ name: 1 }).lean();
    }

    public static async findConflicts(input: ISevenxClassInput, excludeClassId?: string) {
      const query: Record<string, unknown> = {
        status: 'active',
        $or: [
          { teacherId: input.teacherId },
          ...(input.room ? [{ locationId: input.locationId, room: input.room }] : []),
        ],
      };
      if (excludeClassId) {
        query._id = { $ne: excludeClassId };
      }
      const candidates = await models.Classes.find(query).lean();
      const conflicts: ISevenxScheduleConflict[] = [];

      for (const other of candidates) {
        if (!schedulesOverlap(input.schedule, other.schedule)) continue;
        if (other.teacherId === input.teacherId) {
          conflicts.push({
            kind: 'teacher',
            classId: other._id,
            className: other.name,
            message: `Teacher already teaches "${other.name}" at this time`,
          });
        }
        if (input.room && other.locationId === input.locationId && other.room === input.room) {
          conflicts.push({
            kind: 'room',
            classId: other._id,
            className: other.name,
            message: `Room "${input.room}" is used by "${other.name}" at this time`,
          });
        }
      }
      return conflicts;
    }

    private static async validate(input: ISevenxClassInput, excludeClassId?: string) {
      if (!input.name?.trim()) {
        throw new ExpectedError('Class name is required', 'VALIDATION');
      }
      const scheduleError = validateSchedule(input.schedule);
      if (scheduleError) {
        throw new ExpectedError(scheduleError, 'VALIDATION');
      }
      const teacher = await models.Members.getMember(input.teacherId);
      if (teacher.role !== 'teacher') {
        throw new ExpectedError('Selected member is not a teacher', 'VALIDATION');
      }
      const location = await models.Locations.getLocation(input.locationId);
      if (input.room && location.rooms.length && !location.rooms.includes(input.room)) {
        throw new ExpectedError('Room does not exist in this location', 'VALIDATION');
      }
      const conflicts = await models.Classes.findConflicts(input, excludeClassId);
      if (conflicts.length) {
        throw new ExpectedError(conflicts.map((c) => c.message).join('; '), 'CONFLICT');
      }
    }

    public static async createClass(input: ISevenxClassInput) {
      await Class.validate(input);
      return models.Classes.create({
        ...input,
        studentIds: Array.from(new Set(input.studentIds || [])),
        status: 'active',
      });
    }

    public static async updateClass(_id: string, input: ISevenxClassInput) {
      const existing = await models.Classes.getClass(_id);
      await Class.validate(input, _id);
      return models.Classes.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...input,
            studentIds: Array.from(new Set(input.studentIds ?? existing.studentIds)),
          },
        },
        { new: true },
      ).lean();
    }

    public static async removeClass(_id: string) {
      await models.Classes.getClass(_id);
      const assignmentIds = (await models.Assignments.find({ classId: _id }, { _id: 1 }).lean()).map(
        (a) => a._id,
      );
      await models.Submissions.deleteMany({ assignmentId: { $in: assignmentIds } });
      await models.Assignments.deleteMany({ classId: _id });
      await models.Attendances.deleteMany({ classId: _id });
      await models.Announcements.deleteMany({ classId: _id });
      await models.Invites.updateMany({ classIds: _id }, { $pull: { classIds: _id } });
      await models.Classes.deleteOne({ _id });
      return _id;
    }

    public static async addStudents(_id: string, studentIds: string[]) {
      await models.Classes.getClass(_id);
      const students = await models.Members.find({ _id: { $in: studentIds }, role: 'student' }).lean();
      if (students.length !== new Set(studentIds).size) {
        throw new ExpectedError('One or more students were not found', 'VALIDATION');
      }
      return models.Classes.findOneAndUpdate(
        { _id },
        { $addToSet: { studentIds: { $each: studentIds } } },
        { new: true },
      ).lean();
    }

    public static async removeStudent(_id: string, studentId: string) {
      await models.Classes.getClass(_id);
      return models.Classes.findOneAndUpdate(
        { _id },
        { $pull: { studentIds: studentId } },
        { new: true },
      ).lean();
    }
  }

  sevenxClassSchema.loadClass(Class);
  return sevenxClassSchema;
};
