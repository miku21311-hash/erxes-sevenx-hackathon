import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ISevenxMember } from '@/members/@types/members';
import { getActor, portal, shared, SevenxResolver } from '@/common/auth';
import { SevenxRole } from '@/common/types';

interface IInviteArgs {
  email: string;
  role: SevenxRole;
  classIds?: string[];
  firstName?: string;
  lastName?: string;
}

export const sevenxMemberMutations: Record<string, SevenxResolver> = {
  sevenxMemberEdit: async (
    _root,
    { _id, ...doc }: { _id: string } & Partial<ISevenxMember>,
    { models }: IContext,
  ) => models.Members.updateMember(_id, doc),

  sevenxMemberRemove: async (_root, { _id }: { _id: string }, { models }: IContext) =>
    models.Members.removeMember(_id),

  sevenxInviteRemove: async (_root, { _id }: { _id: string }, { models }: IContext) =>
    models.Invites.removeInvite(_id),

  sevenxInviteCreate: shared(async (_root, args: IInviteArgs, context: IContext) => {
    const actor = await getActor(context);
    const { models } = context;

    if (actor.kind === 'member') {
      if (actor.member.role !== 'teacher') {
        throw new ExpectedError('Only teachers can invite students', 'FORBIDDEN');
      }
      if (args.role !== 'student') {
        throw new ExpectedError('Teachers can only invite students', 'FORBIDDEN');
      }
      const classIds = args.classIds || [];
      if (!classIds.length) {
        throw new ExpectedError('Choose at least one of your classes', 'VALIDATION');
      }
      const own = await models.Classes.countDocuments({
        _id: { $in: classIds },
        teacherId: actor.member._id,
      });
      if (own !== classIds.length) {
        throw new ExpectedError('You can only invite into your own classes', 'FORBIDDEN');
      }
    }

    const invitedBy = actor.kind === 'supervisor' ? actor.userId : actor.member._id;
    return models.Invites.createInvite({ ...args, invitedBy });
  }),

  sevenxInviteAccept: portal(async (_root, { token }: { token: string }, { models, cpUser }: IContext) =>
    models.Invites.acceptInvite(token, cpUser._id),
  ),
};
