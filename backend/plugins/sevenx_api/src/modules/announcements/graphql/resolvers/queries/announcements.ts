import { IContext } from '~/connectionResolvers';
import { getActor, shared, visibleClassIds, SevenxResolver } from '@/common/auth';

export const sevenxAnnouncementQueries: Record<string, SevenxResolver> = {
  sevenxAnnouncements: shared(
    async (_root, { classId, limit }: { classId?: string; limit?: number }, context: IContext) => {
      const actor = await getActor(context);
      const classIds = await visibleClassIds(context, actor);
      return context.models.Announcements.listVisible(classIds, classId, limit || 50);
    },
  ),
};
