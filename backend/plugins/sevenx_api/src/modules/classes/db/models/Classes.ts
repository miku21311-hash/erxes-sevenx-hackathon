import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { classesSchema } from '@/classes/db/definitions/classes';
import { IClasses, IClassesDocument } from '@/classes/@types/classes';

export interface IClassesModel extends Model<IClassesDocument> {
  getClasses(_id: string): Promise<IClassesDocument>;
  getClassess(): Promise<IClassesDocument[]>;
  createClasses(doc: IClasses): Promise<IClassesDocument>;
  updateClasses(_id: string, doc: IClasses): Promise<IClassesDocument>;
  removeClasses(ClassesId: string): Promise<{  ok: number }>;
}

export const loadClassesClass = (models: IModels) => {
  class Classes {
    /**
     * Retrieves sevenx
     */
    public static async getClasses(_id: string) {
      const Classes = await models.Classes.findOne({ _id }).lean();

      if (!Classes) {
        throw new Error('Classes not found');
      }

      return Classes;
    }

    /**
     * Retrieves all sevenxs
     */
    public static async getClassess(): Promise<IClassesDocument[]> {
      return models.Classes.find().lean();
    }

    /**
     * Create a sevenx
     */
    public static async createClasses(doc: IClasses): Promise<IClassesDocument> {
      return models.Classes.create(doc);
    }

    /*
     * Update sevenx
     */
    public static async updateClasses(_id: string, doc: IClasses) {
      return await models.Classes.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove sevenx
     */
    public static async removeClasses(ClassesId: string[]) {
      return models.Classes.deleteOne({ _id: { $in: ClassesId } });
    }
  }

  classesSchema.loadClass(Classes);

  return classesSchema;
};
