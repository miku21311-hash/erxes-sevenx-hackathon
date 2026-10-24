import { Document } from 'mongoose';
import { SevenxMemberStatus, SevenxRole } from '@/common/types';

export interface ISevenxMember {
  cpUserId?: string;
  role: SevenxRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: SevenxMemberStatus;
}

export interface ISevenxMemberDocument extends ISevenxMember, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxInvite {
  token: string;
  email: string;
  role: SevenxRole;
  classIds: string[];
  firstName?: string;
  lastName?: string;
  memberId: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface ISevenxInviteDocument extends ISevenxInvite, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxInviteCreateInput {
  email: string;
  role: SevenxRole;
  classIds?: string[];
  firstName?: string;
  lastName?: string;
  invitedBy: string;
}
