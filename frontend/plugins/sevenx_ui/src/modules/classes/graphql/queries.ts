import { gql } from '@apollo/client';

export const SEVENX_MEMBER_BRIEF_FIELDS = `
  _id
  role
  firstName
  lastName
  email
  phone
  status
`;

export const SEVENX_SCHEDULE_FIELDS = `
  daysOfWeek
  startTime
  endTime
  startDate
  endDate
`;

export const SEVENX_CLASS_LIST_FIELDS = `
  _id
  name
  description
  teacherId
  teacher {
    ${SEVENX_MEMBER_BRIEF_FIELDS}
  }
  locationId
  location {
    _id
    name
    rooms
  }
  room
  studentIds
  schedule {
    ${SEVENX_SCHEDULE_FIELDS}
  }
  status
  nextSession
  createdAt
`;

export const SEVENX_CLASSES = gql`
  query sevenxClassesList(
    $locationId: String
    $teacherId: String
    $searchValue: String
    $status: String
  ) {
    sevenxClasses(
      locationId: $locationId
      teacherId: $teacherId
      searchValue: $searchValue
      status: $status
    ) {
      ${SEVENX_CLASS_LIST_FIELDS}
    }
  }
`;

export const SEVENX_CLASS_DETAIL = gql`
  query sevenxClassDetailQuery($_id: String!) {
    sevenxClassDetail(_id: $_id) {
      ${SEVENX_CLASS_LIST_FIELDS}
      students {
        ${SEVENX_MEMBER_BRIEF_FIELDS}
      }
    }
  }
`;

export const SEVENX_SCHEDULE_CONFLICTS = gql`
  query sevenxScheduleConflictsQuery(
    $input: SevenxClassInput!
    $excludeClassId: String
  ) {
    sevenxScheduleConflicts(input: $input, excludeClassId: $excludeClassId) {
      kind
      classId
      className
      message
    }
  }
`;

export const SEVENX_CLASS_SESSIONS = gql`
  query sevenxClassSessionsQuery($classId: String!, $from: String, $to: String) {
    sevenxClassSessions(classId: $classId, from: $from, to: $to) {
      date
      startTime
      endTime
      isToday
      isPast
    }
  }
`;

export const SEVENX_ATTENDANCE_REPORT = gql`
  query sevenxAttendanceReportQuery(
    $classId: String!
    $from: String
    $to: String
  ) {
    sevenxAttendanceReport(classId: $classId, from: $from, to: $to) {
      _id
      classId
      date
      studentId
      status
      note
    }
  }
`;

export const SEVENX_CLASS_ATTENDANCE_SUMMARY = gql`
  query sevenxClassAttendanceSummaryQuery($classId: String!) {
    sevenxClassAttendanceSummary(classId: $classId) {
      total
      present
      late
      absent
      excused
      rate
    }
  }
`;

export const SEVENX_ASSIGNMENTS = gql`
  query sevenxAssignmentsList($classId: String!) {
    sevenxAssignments(classId: $classId) {
      _id
      classId
      title
      description
      attachments {
        url
        name
      }
      dueDate
      maxScore
      createdBy
      createdAt
      submissionCount
      gradedCount
    }
  }
`;
