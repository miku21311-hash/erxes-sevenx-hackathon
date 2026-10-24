import { gql } from '@apollo/client';
import { SEVENX_INVITE_FIELDS } from './queries';

export const SEVENX_INVITE_CREATE = gql`
  mutation sevenxInviteCreateMutation(
    $email: String!
    $role: SevenxRole!
    $classIds: [String!]
    $firstName: String
    $lastName: String
  ) {
    sevenxInviteCreate(
      email: $email
      role: $role
      classIds: $classIds
      firstName: $firstName
      lastName: $lastName
    ) {
      ${SEVENX_INVITE_FIELDS}
    }
  }
`;

export const SEVENX_INVITE_REMOVE = gql`
  mutation sevenxInviteRemoveMutation($_id: String!) {
    sevenxInviteRemove(_id: $_id)
  }
`;

export const SEVENX_MEMBER_REMOVE = gql`
  mutation sevenxMemberRemoveMutation($_id: String!) {
    sevenxMemberRemove(_id: $_id)
  }
`;
