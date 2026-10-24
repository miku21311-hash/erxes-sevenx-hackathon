import { Document } from 'mongoose';
import { ISevenxAttachment, SevenxAnnouncementScope } from '@/common/types';

export interface ISevenxAnnouncementInput {
  scope: SevenxAnnouncementScope;
  classId?: string;
  title: string;
  body: string;
  attachments?: ISevenxAttachment[];
}

export interface ISevenxAnnouncement extends ISevenxAnnouncementInput {
  attachments: ISevenxAttachment[];
  createdBy: string;
  createdByName?: string;
  readBy: string[];
}

export interface ISevenxAnnouncementDocument extends ISevenxAnnouncement, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
