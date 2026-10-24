import { gql } from '@apollo/client';

export const SEVENX_MEMBER_FIELDS = `
  _id
  cpUserId
  role
  firstName
  lastName
  email
  phone
  status
  classIds
  createdAt
`;

export const SEVENX_MEMBERS = gql`
  query sevenxMembersList(
    $role: SevenxRole
    $searchValue: String
    $classId: String
  ) {
    sevenxMembers(role: $role, searchValue: $searchValue, classId: $classId) {
      ${SEVENX_MEMBER_FIELDS}
    }
  }
`;

export const SEVENX_INVITE_FIELDS = `
  _id
  token
  email
  role
  classIds
  firstName
  lastName
  expiresAt
  acceptedAt
  url
`;

export const SEVENX_INVITES = gql`
  query sevenxInvitesList($role: SevenxRole, $classId: String) {
    sevenxInvites(role: $role, classId: $classId) {
      ${SEVENX_INVITE_FIELDS}
    }
  }
`;
