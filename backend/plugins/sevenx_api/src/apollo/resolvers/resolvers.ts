import { SevenxInvite, SevenxMember } from '@/members/graphql/resolvers/customResolvers/members';
import { SevenxClass } from '@/classes/graphql/resolvers/customResolvers/classes';
import {
  SevenxAttendance,
  SevenxAttendanceSummary,
} from '@/attendance/graphql/resolvers/customResolvers/attendance';
import {
  SevenxAssignment,
  SevenxSubmission,
} from '@/assignments/graphql/resolvers/customResolvers/assignments';
import { SevenxAnnouncement } from '@/announcements/graphql/resolvers/customResolvers/announcements';

export const customResolvers = {
  SevenxMember,
  SevenxInvite,
  SevenxClass,
  SevenxAttendance,
  SevenxAttendanceSummary,
  SevenxAssignment,
  SevenxSubmission,
  SevenxAnnouncement,
};
