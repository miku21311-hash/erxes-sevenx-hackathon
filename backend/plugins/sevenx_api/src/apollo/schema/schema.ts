import {
  mutations as ClassesMutations,
  queries as ClassesQueries,
  types as ClassesTypes,
} from '@/classes/graphql/schemas/classes';

export const types = `
  ${ClassesTypes}
`;

export const queries = `
  ${ClassesQueries}
`;

export const mutations = `
  ${ClassesMutations}
`;
