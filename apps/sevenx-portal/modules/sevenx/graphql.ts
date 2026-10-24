import { gql } from '@apollo/client';

// ---- fragments ----

export const SEVENX_ATTACHMENT_FIELDS = gql`
  fragment SevenxPortalAttachmentFields on SevenxAttachment {
    url
    name
    size
    type
  }
`;

export const SEVENX_MEMBER_FIELDS = gql`
  fragment SevenxPortalMemberFields on SevenxMember {
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
  }
`;

export const SEVENX_CLASS_FIELDS = gql`
  fragment SevenxPortalClassFields on SevenxClass {
    _id
    name
    description
    teacherId
    teacher {
      ...SevenxPortalMemberFields
    }
    locationId
    location {
      _id
      name
      address
      rooms
    }
    room
    studentIds
    students {
      ...SevenxPortalMemberFields
    }
    schedule {
      daysOfWeek
      startTime
      endTime
      startDate
      endDate
    }
    status
    nextSession
    createdAt
  }
  ${SEVENX_MEMBER_FIELDS}
`;

export const SEVENX_SUBMISSION_FIELDS = gql`
  fragment SevenxPortalSubmissionFields on SevenxSubmission {
    _id
    assignmentId
    studentId
    student {
      ...SevenxPortalMemberFields
    }
    text
    attachments {
      ...SevenxPortalAttachmentFields
    }
    submittedAt
    score
    feedback
    gradedAt
    isLate
  }
  ${SEVENX_MEMBER_FIELDS}
  ${SEVENX_ATTACHMENT_FIELDS}
`;

export const SEVENX_ASSIGNMENT_FIELDS = gql`
  fragment SevenxPortalAssignmentFields on SevenxAssignment {
    _id
    classId
    title
    description
    attachments {
      ...SevenxPortalAttachmentFields
    }
    dueDate
    maxScore
    createdBy
    createdAt
    submissionCount
    gradedCount
    mySubmission {
      ...SevenxPortalSubmissionFields
    }
  }
  ${SEVENX_ATTACHMENT_FIELDS}
  ${SEVENX_SUBMISSION_FIELDS}
`;

export const SEVENX_ANNOUNCEMENT_FIELDS = gql`
  fragment SevenxPortalAnnouncementFields on SevenxAnnouncement {
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
      ...SevenxPortalAttachmentFields
    }
    createdBy
    createdByName
    createdAt
    readCount
    isRead
  }
  ${SEVENX_ATTACHMENT_FIELDS}
`;

export const SEVENX_ATTENDANCE_FIELDS = gql`
  fragment SevenxPortalAttendanceFields on SevenxAttendance {
    _id
    classId
    date
    studentId
    student {
      ...SevenxPortalMemberFields
    }
    status
    note
    markedBy
    updatedAt
  }
  ${SEVENX_MEMBER_FIELDS}
`;

// ---- core (erxes client portal) ----

export const CP_LOGIN = gql`
  mutation sevenxPortalLogin($email: String, $password: String) {
    clientPortalUserLoginWithCredentials(email: $email, password: $password)
  }
`;

export const CP_LOGOUT = gql`
  mutation sevenxPortalLogout {
    clientPortalLogout
  }
`;

export const CP_REGISTER = gql`
  mutation sevenxPortalRegister(
    $email: String
    $password: String
    $firstName: String
    $lastName: String
  ) {
    clientPortalUserRegister(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      _id
      email
      firstName
      lastName
    }
  }
`;

export const CP_CURRENT_USER = gql`
  query sevenxPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      email
      firstName
      lastName
    }
  }
`;

// ---- sevenx queries ----

export const SEVENX_ME = gql`
  query sevenxPortalMe {
    sevenxMe {
      ...SevenxPortalMemberFields
    }
  }
  ${SEVENX_MEMBER_FIELDS}
`;

export const SEVENX_MY_CLASSES = gql`
  query sevenxPortalMyClasses {
    sevenxMyClasses {
      ...SevenxPortalClassFields
    }
  }
  ${SEVENX_CLASS_FIELDS}
`;

export const SEVENX_CLASS_DETAIL = gql`
  query sevenxPortalClassDetail($_id: String!) {
    sevenxClassDetail(_id: $_id) {
      ...SevenxPortalClassFields
    }
  }
  ${SEVENX_CLASS_FIELDS}
`;

export const SEVENX_CLASS_SESSIONS = gql`
  query sevenxPortalClassSessions($classId: String!, $from: String, $to: String) {
    sevenxClassSessions(classId: $classId, from: $from, to: $to) {
      date
      startTime
      endTime
      isToday
      isPast
    }
  }
`;

export const SEVENX_ATTENDANCE_BY_DATE = gql`
  query sevenxPortalAttendanceByDate($classId: String!, $date: String!) {
    sevenxAttendanceByDate(classId: $classId, date: $date) {
      ...SevenxPortalAttendanceFields
    }
  }
  ${SEVENX_ATTENDANCE_FIELDS}
`;

export const SEVENX_MY_ATTENDANCE = gql`
  query sevenxPortalMyAttendance($classId: String!) {
    sevenxMyAttendance(classId: $classId) {
      ...SevenxPortalAttendanceFields
    }
  }
  ${SEVENX_ATTENDANCE_FIELDS}
`;

export const SEVENX_MY_ATTENDANCE_SUMMARY = gql`
  query sevenxPortalMyAttendanceSummary($classId: String!) {
    sevenxMyAttendanceSummary(classId: $classId) {
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
  query sevenxPortalAssignments($classId: String!) {
    sevenxAssignments(classId: $classId) {
      ...SevenxPortalAssignmentFields
    }
  }
  ${SEVENX_ASSIGNMENT_FIELDS}
`;

export const SEVENX_SUBMISSIONS = gql`
  query sevenxPortalSubmissions($assignmentId: String!) {
    sevenxSubmissions(assignmentId: $assignmentId) {
      ...SevenxPortalSubmissionFields
    }
  }
  ${SEVENX_SUBMISSION_FIELDS}
`;

export const SEVENX_ANNOUNCEMENTS = gql`
  query sevenxPortalAnnouncements($classId: String, $limit: Int) {
    sevenxAnnouncements(classId: $classId, limit: $limit) {
      ...SevenxPortalAnnouncementFields
    }
  }
  ${SEVENX_ANNOUNCEMENT_FIELDS}
`;

export const SEVENX_INVITE_CHECK = gql`
  query sevenxPortalInviteCheck($token: String!) {
    sevenxInviteCheck(token: $token) {
      valid
      email
      role
      firstName
      lastName
      classNames
      reason
    }
  }
`;

// ---- sevenx mutations ----

export const SEVENX_INVITE_ACCEPT = gql`
  mutation sevenxPortalInviteAccept($token: String!) {
    sevenxInviteAccept(token: $token) {
      ...SevenxPortalMemberFields
    }
  }
  ${SEVENX_MEMBER_FIELDS}
`;

export const SEVENX_INVITE_CREATE = gql`
  mutation sevenxPortalInviteCreate(
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
    }
  }
`;

export const SEVENX_ATTENDANCE_MARK = gql`
  mutation sevenxPortalAttendanceMark(
    $classId: String!
    $date: String!
    $items: [SevenxAttendanceItemInput!]!
  ) {
    sevenxAttendanceMark(classId: $classId, date: $date, items: $items) {
      ...SevenxPortalAttendanceFields
    }
  }
  ${SEVENX_ATTENDANCE_FIELDS}
`;

export const SEVENX_ASSIGNMENT_ADD = gql`
  mutation sevenxPortalAssignmentAdd($input: SevenxAssignmentInput!) {
    sevenxAssignmentAdd(input: $input) {
      ...SevenxPortalAssignmentFields
    }
  }
  ${SEVENX_ASSIGNMENT_FIELDS}
`;

export const SEVENX_ASSIGNMENT_EDIT = gql`
  mutation sevenxPortalAssignmentEdit($_id: String!, $input: SevenxAssignmentInput!) {
    sevenxAssignmentEdit(_id: $_id, input: $input) {
      ...SevenxPortalAssignmentFields
    }
  }
  ${SEVENX_ASSIGNMENT_FIELDS}
`;

export const SEVENX_ASSIGNMENT_REMOVE = gql`
  mutation sevenxPortalAssignmentRemove($_id: String!) {
    sevenxAssignmentRemove(_id: $_id)
  }
`;

export const SEVENX_SUBMISSION_UPSERT = gql`
  mutation sevenxPortalSubmissionUpsert(
    $assignmentId: String!
    $text: String
    $attachments: [SevenxAttachmentInput!]
  ) {
    sevenxSubmissionUpsert(
      assignmentId: $assignmentId
      text: $text
      attachments: $attachments
    ) {
      ...SevenxPortalSubmissionFields
    }
  }
  ${SEVENX_SUBMISSION_FIELDS}
`;

export const SEVENX_SUBMISSION_GRADE = gql`
  mutation sevenxPortalSubmissionGrade($_id: String!, $score: Int!, $feedback: String) {
    sevenxSubmissionGrade(_id: $_id, score: $score, feedback: $feedback) {
      ...SevenxPortalSubmissionFields
    }
  }
  ${SEVENX_SUBMISSION_FIELDS}
`;

export const SEVENX_ANNOUNCEMENT_ADD = gql`
  mutation sevenxPortalAnnouncementAdd(
    $scope: SevenxAnnouncementScope!
    $classId: String
    $title: String!
    $body: String!
    $attachments: [SevenxAttachmentInput!]
  ) {
    sevenxAnnouncementAdd(
      scope: $scope
      classId: $classId
      title: $title
      body: $body
      attachments: $attachments
    ) {
      ...SevenxPortalAnnouncementFields
    }
  }
  ${SEVENX_ANNOUNCEMENT_FIELDS}
`;

export const SEVENX_ANNOUNCEMENT_MARK_READ = gql`
  mutation sevenxPortalAnnouncementMarkRead($_id: String!) {
    sevenxAnnouncementMarkRead(_id: $_id) {
      ...SevenxPortalAnnouncementFields
    }
  }
  ${SEVENX_ANNOUNCEMENT_FIELDS}
`;
