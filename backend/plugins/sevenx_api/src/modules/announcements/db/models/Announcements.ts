import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxAnnouncementSchema } from '@/announcements/db/definitions/announcements';
import {
  ISevenxAnnouncementDocument,
  ISevenxAnnouncementInput,
} from '@/announcements/@types/announcements';

export interface ISevenxAnnouncementModel extends Model<ISevenxAnnouncementDocument> {
  getAnnouncement(_id: string): Promise<ISevenxAnnouncementDocument>;
  listVisible(classIds: string[] | null, classId?: string, limit?: number): Promise<ISevenxAnnouncementDocument[]>;
  createAnnouncement(
    input: ISevenxAnnouncementInput,
    createdBy: string,
    createdByName?: string,
  ): Promise<ISevenxAnnouncementDocument>;
  markRead(_id: string, memberId: string): Promise<ISevenxAnnouncementDocument>;
  removeAnnouncement(_id: string): Promise<string>;
}

export const loadSevenxAnnouncementClass = (models: IModels) => {
  class Announcement {
    public static async getAnnouncement(_id: string) {
      const announcement = await models.Announcements.findOne({ _id }).lean();
      if (!announcement) {
        throw new ExpectedError('Announcement not found', 'NOT_FOUND');
      }
      return announcement;
    }

    /**
     * classIds === null means "supervisor": everything is visible.
     * Otherwise returns global announcements plus those of the given classes.
     */
    public static async listVisible(classIds: string[] | null, classId?: string, limit = 50) {
      let query: Record<string, unknown> = {};
      if (classId) {
        query = { scope: 'class', classId };
        if (classIds && !classIds.includes(classId)) {
          throw new ExpectedError('You do not have access to this class', 'FORBIDDEN');
        }
      } else if (classIds) {
        query = { $or: [{ scope: 'all' }, { scope: 'class', classId: { $in: classIds } }] };
      }
      return models.Announcements.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    }

    public static async createAnnouncement(
      input: ISevenxAnnouncementInput,
      createdBy: string,
      createdByName?: string,
    ) {
      if (!input.title?.trim() || !input.body?.trim()) {
        throw new ExpectedError('Title and body are required', 'VALIDATION');
      }
      if (input.scope === 'class') {
        if (!input.classId) {
          throw new ExpectedError('classId is required for class announcements', 'VALIDATION');
        }
        await models.Classes.getClass(input.classId);
      }
      return models.Announcements.create({
        ...input,
        classId: input.scope === 'class' ? input.classId : undefined,
        attachments: input.attachments || [],
        createdBy,
        createdByName,
        readBy: [],
      });
    }

    public static async markRead(_id: string, memberId: string) {
      await models.Announcements.getAnnouncement(_id);
      return models.Announcements.findOneAndUpdate(
        { _id },
        { $addToSet: { readBy: memberId } },
        { new: true },
      ).lean();
    }

    public static async removeAnnouncement(_id: string) {
      await models.Announcements.getAnnouncement(_id);
      await models.Announcements.deleteOne({ _id });
      return _id;
    }
  }

  sevenxAnnouncementSchema.loadClass(Announcement);
  return sevenxAnnouncementSchema;
};
