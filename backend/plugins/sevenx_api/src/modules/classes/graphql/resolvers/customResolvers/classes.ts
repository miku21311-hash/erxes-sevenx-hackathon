import { IContext } from '~/connectionResolvers';
import { ISevenxClassDocument } from '@/classes/@types/classes';
import { nextSessionDate } from '@/common/schedule';

export const SevenxClass = {
  async teacher(cls: ISevenxClassDocument, _args: unknown, { models }: IContext) {
    return await models.Members.findOne({ _id: cls.teacherId }).lean();
  },
  async location(cls: ISevenxClassDocument, _args: unknown, { models }: IContext) {
    return await models.Locations.findOne({ _id: cls.locationId }).lean();
  },
  async students(cls: ISevenxClassDocument, _args: unknown, { models }: IContext) {
    return await models.Members.find({ _id: { $in: cls.studentIds } })
      .sort({ lastName: 1, firstName: 1 })
      .lean();
  },
  nextSession(cls: ISevenxClassDocument) {
    return nextSessionDate(cls.schedule);
  },
};
