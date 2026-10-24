import { Document } from 'mongoose';

export interface IClasses {
  name?: string;
}

export interface IClassesDocument extends IClasses, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
