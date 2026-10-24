import { sevenxAttachmentTypes } from '@/common/attachments';

export const types = `
  ${sevenxAttachmentTypes}

  enum SevenxRole { teacher student }
  enum SevenxMemberStatus { invited active }
  enum SevenxAttendanceStatus { present late absent excused }
  enum SevenxAnnouncementScope { all class }

  type SevenxLocation {
    _id: String!
    name: String!
    address: String
    rooms: [String!]!
    createdAt: Date
  }

  type SevenxMember {
    _id: String!
    cpUserId: String
    role: SevenxRole!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    status: SevenxMemberStatus!
    classIds: [String!]!
    createdAt: Date
  }

  type SevenxSchedule {
    daysOfWeek: [Int!]!
    startTime: String!
    endTime: String!
    startDate: Date!
    endDate: Date!
  }

  input SevenxScheduleInput {
    daysOfWeek: [Int!]!
    startTime: String!
    endTime: String!
    startDate: Date!
    endDate: Date!
  }

  type SevenxClass {
    _id: String!
    name: String!
    description: String
    teacherId: String!
    teacher: SevenxMember
    locationId: String!
    location: SevenxLocation
    room: String
    studentIds: [String!]!
    students: [SevenxMember!]!
    schedule: SevenxSchedule!
    status: String!
    nextSession: Date
    createdAt: Date
  }

  input SevenxClassInput {
    name: String!
    description: String
    teacherId: String!
    locationId: String!
    room: String
    studentIds: [String!]
    schedule: SevenxScheduleInput!
  }

  type SevenxScheduleConflict {
    kind: String!
    classId: String!
    className: String!
    message: String!
  }

  type SevenxSession {
    date: String!
    startTime: String!
    endTime: String!
    isToday: Boolean!
    isPast: Boolean!
  }

  type SevenxAttendance {
    _id: String!
    classId: String!
    date: String!
    studentId: String!
    student: SevenxMember
    status: SevenxAttendanceStatus!
    note: String
    markedBy: String
    updatedAt: Date
  }

  input SevenxAttendanceItemInput {
    studentId: String!
    status: SevenxAttendanceStatus!
    note: String
  }

  type SevenxAttendanceSummary {
    studentId: String!
    student: SevenxMember
    total: Int!
    present: Int!
    late: Int!
    absent: Int!
    excused: Int!
    rate: Float!
  }

  type SevenxAssignment {
    _id: String!
    classId: String!
    title: String!
    description: String
    attachments: [SevenxAttachment!]!
    dueDate: Date!
    maxScore: Int!
    createdBy: String!
    createdAt: Date
    submissionCount: Int!
    gradedCount: Int!
    mySubmission: SevenxSubmission
  }

  input SevenxAssignmentInput {
    classId: String!
    title: String!
    description: String
    attachments: [SevenxAttachmentInput!]
    dueDate: Date!
    maxScore: Int
  }

  type SevenxSubmission {
    _id: String!
    assignmentId: String!
    studentId: String!
    student: SevenxMember
    text: String
    attachments: [SevenxAttachment!]!
    submittedAt: Date!
    score: Int
    feedback: String
    gradedAt: Date
    isLate: Boolean!
  }

  type SevenxAnnouncement {
    _id: String!
    scope: SevenxAnnouncementScope!
    classId: String
    class: SevenxClass
    title: String!
    body: String!
    attachments: [SevenxAttachment!]!
    createdBy: String!
    createdByName: String
    createdAt: Date
    readCount: Int!
    isRead: Boolean!
  }

  type SevenxInvite {
    _id: String!
    token: String!
    email: String!
    role: SevenxRole!
    classIds: [String!]!
    firstName: String
    lastName: String
    expiresAt: Date!
    acceptedAt: Date
    url: String!
  }

  type SevenxInviteCheck {
    valid: Boolean!
    email: String
    role: SevenxRole
    firstName: String
    lastName: String
    classNames: [String!]!
    reason: String
  }

  type SevenxDashboardStats {
    teacherCount: Int!
    studentCount: Int!
    classCount: Int!
    locationCount: Int!
    todaySessions: [SevenxClass!]!
    weeklyAttendanceRate: Float!
    pendingInvites: Int!
  }
`;

export const queries = `
  sevenxDashboardStats: SevenxDashboardStats!
  sevenxLocations: [SevenxLocation!]!
  sevenxMembers(role: SevenxRole, searchValue: String, classId: String): [SevenxMember!]!
  sevenxClasses(locationId: String, teacherId: String, searchValue: String, status: String): [SevenxClass!]!
  sevenxClassDetail(_id: String!): SevenxClass
  sevenxScheduleConflicts(input: SevenxClassInput!, excludeClassId: String): [SevenxScheduleConflict!]!
  sevenxAttendanceReport(classId: String!, from: String, to: String): [SevenxAttendance!]!
  sevenxInvites(role: SevenxRole, classId: String): [SevenxInvite!]!
  sevenxAnnouncements(classId: String, limit: Int): [SevenxAnnouncement!]!

  sevenxMe: SevenxMember
  sevenxMyClasses: [SevenxClass!]!
  sevenxClassSessions(classId: String!, from: String, to: String): [SevenxSession!]!
  sevenxAttendanceByDate(classId: String!, date: String!): [SevenxAttendance!]!
  sevenxMyAttendance(classId: String!): [SevenxAttendance!]!
  sevenxMyAttendanceSummary(classId: String!): SevenxAttendanceSummary!
  sevenxClassAttendanceSummary(classId: String!): [SevenxAttendanceSummary!]!
  sevenxAssignments(classId: String!): [SevenxAssignment!]!
  sevenxAssignmentDetail(_id: String!): SevenxAssignment
  sevenxSubmissions(assignmentId: String!): [SevenxSubmission!]!

  sevenxInviteCheck(token: String!): SevenxInviteCheck!
`;

export const mutations = `
  sevenxLocationAdd(name: String!, address: String, rooms: [String!]): SevenxLocation!
  sevenxLocationEdit(_id: String!, name: String!, address: String, rooms: [String!]): SevenxLocation!
  sevenxLocationRemove(_id: String!): String!
  sevenxClassAdd(input: SevenxClassInput!): SevenxClass!
  sevenxClassEdit(_id: String!, input: SevenxClassInput!): SevenxClass!
  sevenxClassRemove(_id: String!): String!
  sevenxClassAddStudents(_id: String!, studentIds: [String!]!): SevenxClass!
  sevenxClassRemoveStudent(_id: String!, studentId: String!): SevenxClass!
  sevenxMemberEdit(_id: String!, firstName: String, lastName: String, phone: String): SevenxMember!
  sevenxMemberRemove(_id: String!): String!
  sevenxInviteRemove(_id: String!): String!

  sevenxInviteCreate(email: String!, role: SevenxRole!, classIds: [String!], firstName: String, lastName: String): SevenxInvite!
  sevenxAnnouncementAdd(scope: SevenxAnnouncementScope!, classId: String, title: String!, body: String!, attachments: [SevenxAttachmentInput!]): SevenxAnnouncement!
  sevenxAnnouncementRemove(_id: String!): String!

  sevenxInviteAccept(token: String!): SevenxMember!
  sevenxAttendanceMark(classId: String!, date: String!, items: [SevenxAttendanceItemInput!]!): [SevenxAttendance!]!
  sevenxAssignmentAdd(input: SevenxAssignmentInput!): SevenxAssignment!
  sevenxAssignmentEdit(_id: String!, input: SevenxAssignmentInput!): SevenxAssignment!
  sevenxAssignmentRemove(_id: String!): String!
  sevenxSubmissionUpsert(assignmentId: String!, text: String, attachments: [SevenxAttachmentInput!]): SevenxSubmission!
  sevenxSubmissionGrade(_id: String!, score: Int!, feedback: String): SevenxSubmission!
  sevenxAnnouncementMarkRead(_id: String!): SevenxAnnouncement!
`;
