import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const sevenxMemberSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    cpUserId: { type: String, index: true, sparse: true, label: 'Client portal user' },
    role: { type: String, enum: ['teacher', 'student'], required: true, label: 'Role' },
    firstName: { type: String, required: true, label: 'First name' },
    lastName: { type: String, required: true, label: 'Last name' },
    email: { type: String, required: true, lowercase: true, trim: true, label: 'Email' },
    phone: { type: String, label: 'Phone' },
    status: { type: String, enum: ['invited', 'active'], default: 'invited', label: 'Status' },
  },
  { timestamps: true },
);

sevenxMemberSchema.index({ email: 1, role: 1 }, { unique: true });

export const sevenxInviteSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    token: { type: String, required: true, unique: true, label: 'Token' },
    email: { type: String, required: true, lowercase: true, trim: true, label: 'Email' },
    role: { type: String, enum: ['teacher', 'student'], required: true, label: 'Role' },
    classIds: { type: [String], default: [], label: 'Classes' },
    firstName: { type: String, label: 'First name' },
    lastName: { type: String, label: 'Last name' },
    memberId: { type: String, required: true, label: 'Member' },
    invitedBy: { type: String, required: true, label: 'Invited by' },
    expiresAt: { type: Date, required: true, label: 'Expires at' },
    acceptedAt: { type: Date, label: 'Accepted at' },
  },
  { timestamps: true },
);
