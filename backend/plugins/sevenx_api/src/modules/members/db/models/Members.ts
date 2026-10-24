import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxMemberSchema } from '@/members/db/definitions/members';
import { ISevenxMember, ISevenxMemberDocument } from '@/members/@types/members';
import { SevenxRole } from '@/common/types';

export interface ISevenxMemberFilter {
  role?: SevenxRole;
  searchValue?: string;
  classId?: string;
}

export interface ISevenxMemberModel extends Model<ISevenxMemberDocument> {
  getMember(_id: string): Promise<ISevenxMemberDocument>;
  getMemberByCpUser(cpUserId: string): Promise<ISevenxMemberDocument | null>;
  listMembers(filter: ISevenxMemberFilter): Promise<ISevenxMemberDocument[]>;
  createMember(doc: ISevenxMember): Promise<ISevenxMemberDocument>;
  updateMember(_id: string, doc: Partial<ISevenxMember>): Promise<ISevenxMemberDocument>;
  removeMember(_id: string): Promise<string>;
}

export const loadSevenxMemberClass = (models: IModels) => {
  class Member {
    public static async getMember(_id: string) {
      const member = await models.Members.findOne({ _id }).lean();
      if (!member) {
        throw new ExpectedError('Member not found', 'NOT_FOUND');
      }
      return member;
    }

    public static async getMemberByCpUser(cpUserId: string) {
      return models.Members.findOne({ cpUserId }).lean();
    }

    public static async listMembers(filter: ISevenxMemberFilter) {
      const query: Record<string, unknown> = {};
      if (filter.role) {
        query.role = filter.role;
      }
      if (filter.searchValue) {
        const re = new RegExp(filter.searchValue.trim(), 'i');
        query.$or = [{ firstName: re }, { lastName: re }, { email: re }];
      }
      if (filter.classId) {
        const cls = await models.Classes.getClass(filter.classId);
        query._id = { $in: [cls.teacherId, ...cls.studentIds] };
      }
      return models.Members.find(query).sort({ lastName: 1, firstName: 1 }).lean();
    }

    public static async createMember(doc: ISevenxMember) {
      const existing = await models.Members.findOne({
        email: doc.email.toLowerCase().trim(),
        role: doc.role,
      }).lean();
      if (existing) {
        throw new ExpectedError(
          `A ${doc.role} with this email already exists`,
          'VALIDATION',
        );
      }
      return models.Members.create(doc);
    }

    public static async updateMember(_id: string, doc: Partial<ISevenxMember>) {
      await models.Members.getMember(_id);
      return models.Members.findOneAndUpdate({ _id }, { $set: doc }, { new: true }).lean();
    }

    public static async removeMember(_id: string) {
      const member = await models.Members.getMember(_id);
      if (member.role === 'teacher') {
        const teaching = await models.Classes.countDocuments({ teacherId: _id });
        if (teaching > 0) {
          throw new ExpectedError(
            'Teacher is assigned to classes and cannot be removed',
            'VALIDATION',
          );
        }
      } else {
        await models.Classes.updateMany({ studentIds: _id }, { $pull: { studentIds: _id } });
        await models.Attendances.deleteMany({ studentId: _id });
        await models.Submissions.deleteMany({ studentId: _id });
      }
      await models.Invites.deleteMany({ memberId: _id });
      await models.Members.deleteOne({ _id });
      return _id;
    }
  }

  sevenxMemberSchema.loadClass(Member);
  return sevenxMemberSchema;
};
