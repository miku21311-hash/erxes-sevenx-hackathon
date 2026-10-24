import { sevenxLocationMutations } from '@/locations/graphql/resolvers/mutations/locations';
import { sevenxMemberMutations } from '@/members/graphql/resolvers/mutations/members';
import { sevenxClassMutations } from '@/classes/graphql/resolvers/mutations/classes';
import { sevenxAttendanceMutations } from '@/attendance/graphql/resolvers/mutations/attendance';
import { sevenxAssignmentMutations } from '@/assignments/graphql/resolvers/mutations/assignments';
import { sevenxAnnouncementMutations } from '@/announcements/graphql/resolvers/mutations/announcements';

export const mutations = {
  ...sevenxLocationMutations,
  ...sevenxMemberMutations,
  ...sevenxClassMutations,
  ...sevenxAttendanceMutations,
  ...sevenxAssignmentMutations,
  ...sevenxAnnouncementMutations,
};
