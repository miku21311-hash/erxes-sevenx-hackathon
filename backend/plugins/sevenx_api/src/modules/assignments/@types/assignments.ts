import { Document } from 'mongoose';
import { ISevenxAttachment } from '@/common/types';

export interface ISevenxAssignmentInput {
  classId: string;
  title: string;
  description?: string;
  attachments?: ISevenxAttachment[];
  dueDate: Date;
  maxScore?: number;
}

export interface ISevenxAssignment extends ISevenxAssignmentInput {
  attachments: ISevenxAttachment[];
  maxScore: number;
  createdBy: string;
}

export interface ISevenxAssignmentDocument extends ISevenxAssignment, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxSubmission {
  assignmentId: string;
  studentId: string;
  text?: string;
  attachments: ISevenxAttachment[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
}

export interface ISevenxSubmissionDocument extends ISevenxSubmission, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
