import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxLocationSchema } from '@/locations/db/definitions/locations';
import {
  ISevenxLocation,
  ISevenxLocationDocument,
} from '@/locations/@types/locations';

export interface ISevenxLocationModel extends Model<ISevenxLocationDocument> {
  getLocation(_id: string): Promise<ISevenxLocationDocument>;
  createLocation(doc: ISevenxLocation): Promise<ISevenxLocationDocument>;
  updateLocation(_id: string, doc: ISevenxLocation): Promise<ISevenxLocationDocument>;
  removeLocation(_id: string): Promise<string>;
}

export const loadSevenxLocationClass = (models: IModels) => {
  class Location {
    public static async getLocation(_id: string) {
      const location = await models.Locations.findOne({ _id }).lean();
      if (!location) {
        throw new ExpectedError('Location not found', 'NOT_FOUND');
      }
      return location;
    }

    public static async createLocation(doc: ISevenxLocation) {
      if (!doc.name?.trim()) {
        throw new ExpectedError('Location name is required', 'VALIDATION');
      }
      return models.Locations.create({ ...doc, rooms: doc.rooms || [] });
    }

    public static async updateLocation(_id: string, doc: ISevenxLocation) {
      await models.Locations.getLocation(_id);
      return models.Locations.findOneAndUpdate(
        { _id },
        { $set: { ...doc, rooms: doc.rooms || [] } },
        { new: true },
      ).lean();
    }

    public static async removeLocation(_id: string) {
      const used = await models.Classes.countDocuments({ locationId: _id });
      if (used > 0) {
        throw new ExpectedError(
          'Location is used by classes and cannot be removed',
          'VALIDATION',
        );
      }
      await models.Locations.deleteOne({ _id });
      return _id;
    }
  }

  sevenxLocationSchema.loadClass(Location);
  return sevenxLocationSchema;
};
