
  import { IContext } from '~/connectionResolvers';

   export const classesQueries = {
    getClasses: async (_parent: unknown, { _id }: { _id: string }, { models }: IContext) => {
      return models.Classes.getClasses(_id);
    },
    
    getClassess: async (_parent: unknown, _args: Record<string, never>, { models }: IContext) => {
      return models.Classes.getClassess();
    },
  };
