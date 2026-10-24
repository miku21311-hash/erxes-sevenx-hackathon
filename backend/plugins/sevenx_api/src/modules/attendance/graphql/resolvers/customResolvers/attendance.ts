import { IContext } from '~/connectionResolvers';

export interface IWithStudent {
  studentId: string;
}

const student = (doc: IWithStudent, _args: unknown, { models }: IContext) =>
  models.Members.findOne({ _id: doc.studentId }).lean();

export const SevenxAttendance = { student };
export const SevenxAttendanceSummary = { student };
