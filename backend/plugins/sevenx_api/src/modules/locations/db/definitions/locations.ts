import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const sevenxLocationSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    address: { type: String, label: 'Address' },
    rooms: { type: [String], default: [], label: 'Rooms' },
  },
  { timestamps: true },
);
