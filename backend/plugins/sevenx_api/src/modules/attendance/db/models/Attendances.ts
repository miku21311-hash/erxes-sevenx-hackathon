import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxAttendanceSchema } from '@/attendance/db/definitions/attendance';
import {
  ISevenxAttendanceDocument,
  ISevenxAttendanceItemInput,
  ISevenxAttendanceSummary,
} from '@/attendance/@types/attendance';
import { isSessionDate, pastSessionDates } from '@/common/schedule';

export interface ISevenxAttendanceModel extends Model<ISevenxAttendanceDocument> {
  markAttendance(
    classId: string,
    date: string,
    items: ISevenxAttendanceItemInput[],
    markedBy: string,
  ): Promise<ISevenxAttendanceDocument[]>;
  listByClass(classId: string, from?: string, to?: string): Promise<ISevenxAttendanceDocument[]>;
  summarize(classId: string, studentIds: string[]): Promise<ISevenxAttendanceSummary[]>;
}

export const loadSevenxAttendanceClass = (models: IModels) => {
  class Attendance {
    public static async markAttendance(
      classId: string,
      date: string,
      items: ISevenxAttendanceItemInput[],
      markedBy: string,
    ) {
      const cls = await models.Classes.getClass(classId);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ExpectedError('date must be YYYY-MM-DD', 'VALIDATION');
      }
      if (!isSessionDate(cls.schedule, date)) {
        throw new ExpectedError('The class has no session on this date', 'VALIDATION');
      }
      const allowed = new Set(cls.studentIds);
      for (const item of items) {
        if (!allowed.has(item.studentId)) {
          throw new ExpectedError('Student is not enrolled in this class', 'VALIDATION');
        }
      }
      if (items.length) {
        await models.Attendances.bulkWrite(
          items.map((item) => ({
            updateOne: {
              filter: { classId, date, studentId: item.studentId },
              update: { $set: { status: item.status, note: item.note, markedBy } },
              upsert: true,
            },
          })),
        );
      }
      return models.Attendances.find({ classId, date }).lean();
    }

    public static async listByClass(classId: string, from?: string, to?: string) {
      const query: Record<string, unknown> = { classId };
      if (from || to) {
        query.date = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
      }
      return models.Attendances.find(query).sort({ date: 1 }).lean();
    }

    public static async summarize(classId: string, studentIds: string[]) {
      const cls = await models.Classes.getClass(classId);
      const total = pastSessionDates(cls.schedule).length;
      const rows = await models.Attendances.find({ classId, studentId: { $in: studentIds } }).lean();

      return studentIds.map((studentId) => {
        const mine = rows.filter((r) => r.studentId === studentId);
        const count = (status: string) => mine.filter((r) => r.status === status).length;
        const present = count('present');
        const late = count('late');
        const excused = count('excused');
        const absentMarked = count('absent');
        const unmarked = Math.max(total - mine.length, 0);
        const absent = absentMarked + unmarked;
        const rate = total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0;
        return { studentId, total, present, late, absent, excused, rate };
      });
    }
  }

  sevenxAttendanceSchema.loadClass(Attendance);
  return sevenxAttendanceSchema;
};
