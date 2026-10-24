import { gql } from '@apollo/client';

export const SEVENX_LOCATION_FIELDS = `
  _id
  name
  address
  rooms
  createdAt
`;

export const SEVENX_LOCATIONS = gql`
  query sevenxLocationsList {
    sevenxLocations {
      ${SEVENX_LOCATION_FIELDS}
    }
  }
`;
