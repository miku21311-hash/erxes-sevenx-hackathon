import { IContext } from '~/connectionResolvers';
import { SevenxResolver } from '@/common/auth';
import { ISevenxLocation } from '@/locations/@types/locations';

export const sevenxLocationMutations: Record<string, SevenxResolver> = {
  sevenxLocationAdd: async (_root, doc: ISevenxLocation, { models }: IContext) =>
    models.Locations.createLocation(doc),

  sevenxLocationEdit: async (
    _root,
    { _id, ...doc }: ISevenxLocation & { _id: string },
    { models }: IContext,
  ) => models.Locations.updateLocation(_id, doc),

  sevenxLocationRemove: async (_root, { _id }: { _id: string }, { models }: IContext) =>
    models.Locations.removeLocation(_id),
};
