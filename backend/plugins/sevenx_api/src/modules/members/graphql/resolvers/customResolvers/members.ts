import { IContext } from '~/connectionResolvers';
import { ISevenxInviteDocument, ISevenxMemberDocument } from '@/members/@types/members';

const portalUrl = () => (process.env.SEVENX_PORTAL_URL || 'http://localhost:3000').replace(/\/$/, '');

export const SevenxMember = {
  async classIds(member: ISevenxMemberDocument, _args: unknown, { models }: IContext) {
    const classes = await models.Classes.find(
      { $or: [{ teacherId: member._id }, { studentIds: member._id }] },
      { _id: 1 },
    ).lean();
    return classes.map((c) => c._id);
  },
};

export const SevenxInvite = {
  url(invite: ISevenxInviteDocument) {
    return `${portalUrl()}/invite/${invite.token}`;
  },
};
