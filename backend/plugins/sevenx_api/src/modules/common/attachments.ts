import { Schema } from 'mongoose';

export const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
  },
  { _id: false },
);

export const sevenxAttachmentTypes = `
  type SevenxAttachment {
    url: String!
    name: String!
    size: Int
    type: String
  }

  input SevenxAttachmentInput {
    url: String!
    name: String!
    size: Int
    type: String
  }
`;
