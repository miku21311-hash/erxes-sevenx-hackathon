import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from '@/common/attachments';

export const sevenxAssignmentSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    classId: { type: String, required: true, index: true, label: 'Class' },
    title: { type: String, required: true, label: 'Title' },
    description: { type: String, label: 'Description' },
    attachments: { type: [attachmentSchema], default: [], label: 'Attachments' },
    dueDate: { type: Date, required: true, label: 'Due date' },
    maxScore: { type: Number, default: 100, label: 'Max score' },
    createdBy: { type: String, required: true, label: 'Created by' },
  },
  { timestamps: true },
);

export const sevenxSubmissionSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    assignmentId: { type: String, required: true, index: true, label: 'Assignment' },
    studentId: { type: String, required: true, index: true, label: 'Student' },
    text: { type: String, label: 'Text' },
    attachments: { type: [attachmentSchema], default: [], label: 'Attachments' },
    submittedAt: { type: Date, required: true, label: 'Submitted at' },
    score: { type: Number, label: 'Score' },
    feedback: { type: String, label: 'Feedback' },
    gradedAt: { type: Date, label: 'Graded at' },
  },
  { timestamps: true },
);

sevenxSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
