
  import { IContext } from '~/connectionResolvers';

  export const classesMutations = {
    createClasses: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Classes.createClasses({name});
    },

    updateClasses: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Classes.updateClasses(_id, {name});
    },

    removeClasses: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Classes.removeClasses(_id);
    },
  };

