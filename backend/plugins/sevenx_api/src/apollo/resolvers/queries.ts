import { sevenxLocationQueries } from '@/locations/graphql/resolvers/queries/locations';
import { sevenxMemberQueries } from '@/members/graphql/resolvers/queries/members';
import { sevenxClassQueries } from '@/classes/graphql/resolvers/queries/classes';
import { sevenxAttendanceQueries } from '@/attendance/graphql/resolvers/queries/attendance';
import { sevenxAssignmentQueries } from '@/assignments/graphql/resolvers/queries/assignments';
import { sevenxAnnouncementQueries } from '@/announcements/graphql/resolvers/queries/announcements';

export const queries = {
  ...sevenxLocationQueries,
  ...sevenxMemberQueries,
  ...sevenxClassQueries,
  ...sevenxAttendanceQueries,
  ...sevenxAssignmentQueries,
  ...sevenxAnnouncementQueries,
};
