import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ISevenxAnnouncementInput } from '@/announcements/@types/announcements';
import { getActor, portal, requireClassAccess, requireMember, shared, SevenxResolver } from '@/common/auth';

export const sevenxAnnouncementMutations: Record<string, SevenxResolver> = {
  sevenxAnnouncementAdd: shared(async (_root, input: ISevenxAnnouncementInput, context: IContext) => {
    const actor = await getActor(context);
    if (actor.kind === 'member') {
      if (input.scope !== 'class' || !input.classId) {
        throw new ExpectedError('Teachers can only post to their own class', 'FORBIDDEN');
      }
      await requireClassAccess(context, input.classId, 'teacher');
    }
    const createdBy = actor.kind === 'supervisor' ? actor.userId : actor.member._id;
    return context.models.Announcements.createAnnouncement(input, createdBy, actor.name);
  }),

  sevenxAnnouncementRemove: shared(async (_root, { _id }: { _id: string }, context: IContext) => {
    const actor = await getActor(context);
    const announcement = await context.models.Announcements.getAnnouncement(_id);
    if (actor.kind === 'member' && announcement.createdBy !== actor.member._id) {
      throw new ExpectedError('You can only remove your own announcements', 'FORBIDDEN');
    }
    return context.models.Announcements.removeAnnouncement(_id);
  }),

  sevenxAnnouncementMarkRead: portal(async (_root, { _id }: { _id: string }, context: IContext) => {
    const member = await requireMember(context);
    return context.models.Announcements.markRead(_id, member._id);
  }),
};
