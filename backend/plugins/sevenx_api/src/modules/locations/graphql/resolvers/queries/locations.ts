import { IContext } from '~/connectionResolvers';
import { SevenxResolver } from '@/common/auth';

export const sevenxLocationQueries: Record<string, SevenxResolver> = {
  sevenxLocations: async (_root, _args, { models }: IContext) =>
    models.Locations.find().sort({ name: 1 }).lean(),
};
