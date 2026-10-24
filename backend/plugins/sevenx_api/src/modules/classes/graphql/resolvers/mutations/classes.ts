import { IContext } from '~/connectionResolvers';
import { SevenxResolver } from '@/common/auth';
import { ISevenxClassInput } from '@/classes/@types/classes';

export const sevenxClassMutations: Record<string, SevenxResolver> = {
  sevenxClassAdd: async (_root, { input }: { input: ISevenxClassInput }, { models }: IContext) =>
    models.Classes.createClass(input),

  sevenxClassEdit: async (
    _root,
    { _id, input }: { _id: string; input: ISevenxClassInput },
    { models }: IContext,
  ) => models.Classes.updateClass(_id, input),

  sevenxClassRemove: async (_root, { _id }: { _id: string }, { models }: IContext) =>
    models.Classes.removeClass(_id),

  sevenxClassAddStudents: async (
    _root,
    { _id, studentIds }: { _id: string; studentIds: string[] },
    { models }: IContext,
  ) => models.Classes.addStudents(_id, studentIds),

  sevenxClassRemoveStudent: async (
    _root,
    { _id, studentId }: { _id: string; studentId: string },
    { models }: IContext,
  ) => models.Classes.removeStudent(_id, studentId),
};
