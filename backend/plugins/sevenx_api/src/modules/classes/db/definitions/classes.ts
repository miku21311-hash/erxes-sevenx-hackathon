import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const scheduleSchema = new Schema(
  {
    daysOfWeek: { type: [Number], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

export const sevenxClassSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, label: 'Description' },
    teacherId: { type: String, required: true, index: true, label: 'Teacher' },
    locationId: { type: String, required: true, index: true, label: 'Location' },
    room: { type: String, label: 'Room' },
    studentIds: { type: [String], default: [], index: true, label: 'Students' },
    schedule: { type: scheduleSchema, required: true, label: 'Schedule' },
    status: { type: String, enum: ['active', 'archived'], default: 'active', label: 'Status' },
  },
  { timestamps: true },
);
