import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const sevenxAttendanceSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    classId: { type: String, required: true, index: true, label: 'Class' },
    date: { type: String, required: true, label: 'Date' },
    studentId: { type: String, required: true, index: true, label: 'Student' },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'excused'],
      required: true,
      label: 'Status',
    },
    note: { type: String, label: 'Note' },
    markedBy: { type: String, label: 'Marked by' },
  },
  { timestamps: true },
);

sevenxAttendanceSchema.index({ classId: 1, date: 1, studentId: 1 }, { unique: true });
