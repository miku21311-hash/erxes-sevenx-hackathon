import { IContext } from '~/connectionResolvers';
import { ISevenxAnnouncementDocument } from '@/announcements/@types/announcements';

export const SevenxAnnouncement = {
  async class(announcement: ISevenxAnnouncementDocument, _args: unknown, { models }: IContext) {
    return announcement.classId
      ? await models.Classes.findOne({ _id: announcement.classId }).lean()
      : null;
  },
  readCount(announcement: ISevenxAnnouncementDocument) {
    return announcement.readBy?.length || 0;
  },
  async isRead(announcement: ISevenxAnnouncementDocument, _args: unknown, { models, cpUser }: IContext) {
    if (!cpUser?._id) {
      return false;
    }
    const member = await models.Members.getMemberByCpUser(cpUser._id);
    return Boolean(member && announcement.readBy?.includes(member._id));
  },
};
