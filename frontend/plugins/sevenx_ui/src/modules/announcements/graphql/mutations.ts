import { gql } from '@apollo/client';
import { SEVENX_ANNOUNCEMENT_FIELDS } from './queries';

export const SEVENX_ANNOUNCEMENT_ADD = gql`
  mutation sevenxAnnouncementAddMutation(
    $scope: SevenxAnnouncementScope!
    $classId: String
    $title: String!
    $body: String!
  ) {
    sevenxAnnouncementAdd(scope: $scope, classId: $classId, title: $title, body: $body) {
      ${SEVENX_ANNOUNCEMENT_FIELDS}
    }
  }
`;

export const SEVENX_ANNOUNCEMENT_REMOVE = gql`
  mutation sevenxAnnouncementRemoveMutation($_id: String!) {
    sevenxAnnouncementRemove(_id: $_id)
  }
`;
