import { IContext } from '~/connectionResolvers';
import { ISevenxMemberFilter } from '@/members/db/models/Members';
import { getActor, portal, publicResolver, requireClassAccess, SevenxResolver } from '@/common/auth';
import { SevenxRole } from '@/common/types';

export const sevenxMemberQueries: Record<string, SevenxResolver> = {
  sevenxMembers: async (_root, filter: ISevenxMemberFilter, { models }: IContext) =>
    models.Members.listMembers(filter),

  sevenxInvites: async (
    _root,
    filter: { role?: SevenxRole; classId?: string },
    context: IContext,
  ) => {
    const actor = await getActor(context);
    if (actor.kind === 'member') {
      if (!filter.classId) {
        return [];
      }
      await requireClassAccess(context, filter.classId, 'teacher');
      return context.models.Invites.listInvites({ role: 'student', classId: filter.classId });
    }
    return context.models.Invites.listInvites(filter);
  },

  sevenxMe: portal(async (_root, _args, { models, cpUser }: IContext) =>
    await models.Members.getMemberByCpUser(cpUser._id),
  ),

  sevenxInviteCheck: publicResolver(async (_root, { token }: { token: string }, { models }: IContext) => {
    const invite = await models.Invites.getInviteByToken(token);
    if (!invite) {
      return { valid: false, classNames: [], reason: 'NOT_FOUND' };
    }
    if (invite.acceptedAt) {
      return { valid: false, email: invite.email, role: invite.role, classNames: [], reason: 'ALREADY_ACCEPTED' };
    }
    if (invite.expiresAt < new Date()) {
      return { valid: false, email: invite.email, role: invite.role, classNames: [], reason: 'EXPIRED' };
    }
    const classes = await models.Classes.find({ _id: { $in: invite.classIds } }, { name: 1 }).lean();
    return {
      valid: true,
      email: invite.email,
      role: invite.role,
      firstName: invite.firstName,
      lastName: invite.lastName,
      classNames: classes.map((c) => c.name),
    };
  }),
};

sevenxMemberQueries.sevenxInvites.wrapperConfig = { skipPermission: true };
