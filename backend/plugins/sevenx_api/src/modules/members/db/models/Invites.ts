import { Model } from 'mongoose';
import { ExpectedError, randomAlphanumeric } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxInviteSchema } from '@/members/db/definitions/members';
import {
  ISevenxInviteCreateInput,
  ISevenxInviteDocument,
  ISevenxMemberDocument,
} from '@/members/@types/members';
import { SevenxRole } from '@/common/types';

const INVITE_TTL_DAYS = 14;

export interface ISevenxInviteModel extends Model<ISevenxInviteDocument> {
  getInvite(_id: string): Promise<ISevenxInviteDocument>;
  getInviteByToken(token: string): Promise<ISevenxInviteDocument | null>;
  listInvites(filter: { role?: SevenxRole; classId?: string }): Promise<ISevenxInviteDocument[]>;
  createInvite(input: ISevenxInviteCreateInput): Promise<ISevenxInviteDocument>;
  acceptInvite(token: string, cpUserId: string): Promise<ISevenxMemberDocument>;
  removeInvite(_id: string): Promise<string>;
}

export const loadSevenxInviteClass = (models: IModels) => {
  class Invite {
    public static async getInvite(_id: string) {
      const invite = await models.Invites.findOne({ _id }).lean();
      if (!invite) {
        throw new ExpectedError('Invite not found', 'NOT_FOUND');
      }
      return invite;
    }

    public static async getInviteByToken(token: string) {
      return models.Invites.findOne({ token }).lean();
    }

    public static async listInvites(filter: { role?: SevenxRole; classId?: string }) {
      const query: Record<string, unknown> = { acceptedAt: { $exists: false } };
      if (filter.role) {
        query.role = filter.role;
      }
      if (filter.classId) {
        query.classIds = filter.classId;
      }
      return models.Invites.find(query).sort({ createdAt: -1 }).lean();
    }

    public static async createInvite(input: ISevenxInviteCreateInput) {
      const email = input.email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ExpectedError('Invalid email', 'VALIDATION');
      }
      const classIds = input.classIds || [];
      for (const classId of classIds) {
        await models.Classes.getClass(classId);
      }

      const existing = await models.Members.findOne({ email, role: input.role }).lean();
      if (existing && existing.status === 'active') {
        throw new ExpectedError(
          `This ${input.role} already has an active account`,
          'VALIDATION',
        );
      }
      const memberId: string = existing
        ? existing._id
        : (
            await models.Members.create({
              email,
              role: input.role,
              firstName: input.firstName?.trim() || '',
              lastName: input.lastName?.trim() || '',
              status: 'invited',
            })
          )._id;

      if (input.role === 'student' && classIds.length) {
        await models.Classes.updateMany(
          { _id: { $in: classIds } },
          { $addToSet: { studentIds: memberId } },
        );
      }

      await models.Invites.deleteMany({ memberId, acceptedAt: { $exists: false } });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

      return models.Invites.create({
        token: randomAlphanumeric(32),
        email,
        role: input.role,
        classIds,
        firstName: input.firstName,
        lastName: input.lastName,
        memberId,
        invitedBy: input.invitedBy,
        expiresAt,
      });
    }

    public static async acceptInvite(token: string, cpUserId: string) {
      const invite = await models.Invites.findOne({ token }).lean();
      if (!invite || invite.acceptedAt) {
        throw new ExpectedError('Invite is invalid or already used', 'NOT_FOUND');
      }
      if (invite.expiresAt < new Date()) {
        throw new ExpectedError('Invite has expired', 'VALIDATION');
      }
      const linked = await models.Members.findOne({ cpUserId }).lean();
      if (linked && linked._id !== invite.memberId) {
        throw new ExpectedError(
          'This account is already linked to another member',
          'VALIDATION',
        );
      }
      const member = await models.Members.findOneAndUpdate(
        { _id: invite.memberId },
        { $set: { cpUserId, status: 'active' } },
        { new: true },
      ).lean();
      if (!member) {
        throw new ExpectedError('Member not found', 'NOT_FOUND');
      }
      await models.Invites.updateOne({ _id: invite._id }, { $set: { acceptedAt: new Date() } });
      return member;
    }

    public static async removeInvite(_id: string) {
      const invite = await models.Invites.getInvite(_id);
      await models.Invites.deleteOne({ _id });
      const member = await models.Members.findOne({ _id: invite.memberId }).lean();
      if (member && member.status === 'invited') {
        await models.Members.removeMember(member._id);
      }
      return _id;
    }
  }

  sevenxInviteSchema.loadClass(Invite);
  return sevenxInviteSchema;
};
