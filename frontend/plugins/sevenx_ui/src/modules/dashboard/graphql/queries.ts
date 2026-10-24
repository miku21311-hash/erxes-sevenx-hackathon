import { gql } from '@apollo/client';

export const SEVENX_DASHBOARD_STATS = gql`
  query sevenxDashboardStatsQuery {
    sevenxDashboardStats {
      teacherCount
      studentCount
      classCount
      locationCount
      weeklyAttendanceRate
      pendingInvites
      todaySessions {
        _id
        name
        room
        teacher {
          _id
          firstName
          lastName
        }
        location {
          _id
          name
        }
        schedule {
          daysOfWeek
          startTime
          endTime
          startDate
          endDate
        }
      }
    }
  }
`;
