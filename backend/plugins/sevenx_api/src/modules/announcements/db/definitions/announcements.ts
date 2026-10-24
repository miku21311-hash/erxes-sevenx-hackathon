import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from '@/common/attachments';

export const sevenxAnnouncementSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    scope: { type: String, enum: ['all', 'class'], required: true, label: 'Scope' },
    classId: { type: String, index: true, label: 'Class' },
    title: { type: String, required: true, label: 'Title' },
    body: { type: String, required: true, label: 'Body' },
    attachments: { type: [attachmentSchema], default: [], label: 'Attachments' },
    createdBy: { type: String, required: true, label: 'Created by' },
    createdByName: { type: String, label: 'Created by name' },
    readBy: { type: [String], default: [], label: 'Read by' },
  },
  { timestamps: true },
);
