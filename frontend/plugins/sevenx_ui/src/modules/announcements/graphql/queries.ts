import { gql } from '@apollo/client';

export const SEVENX_ANNOUNCEMENT_FIELDS = `
  _id
  scope
  classId
  class {
    _id
    name
  }
  title
  body
  attachments {
    url
    name
  }
  createdBy
  createdByName
  createdAt
  readCount
  isRead
`;

export const SEVENX_ANNOUNCEMENTS = gql`
  query sevenxAnnouncementsList($classId: String, $limit: Int) {
    sevenxAnnouncements(classId: $classId, limit: $limit) {
      ${SEVENX_ANNOUNCEMENT_FIELDS}
    }
  }
`;
