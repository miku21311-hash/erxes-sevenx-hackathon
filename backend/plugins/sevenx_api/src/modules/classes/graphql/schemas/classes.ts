export const types = `
  type Classes {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getClasses(_id: String!): Classes
  getClassess: [Classes]
`;

export const mutations = `
  createClasses(name: String!): Classes
  updateClasses(_id: String!, name: String!): Classes
  removeClasses(_id: String!): Classes
`;
