import { gql } from '@apollo/client';
import { SEVENX_CLASS_LIST_FIELDS, SEVENX_MEMBER_BRIEF_FIELDS } from './queries';

const CLASS_WITH_STUDENTS = `
  ${SEVENX_CLASS_LIST_FIELDS}
  students {
    ${SEVENX_MEMBER_BRIEF_FIELDS}
  }
`;

export const SEVENX_CLASS_ADD = gql`
  mutation sevenxClassAddMutation($input: SevenxClassInput!) {
    sevenxClassAdd(input: $input) {
      ${CLASS_WITH_STUDENTS}
    }
  }
`;

export const SEVENX_CLASS_EDIT = gql`
  mutation sevenxClassEditMutation($_id: String!, $input: SevenxClassInput!) {
    sevenxClassEdit(_id: $_id, input: $input) {
      ${CLASS_WITH_STUDENTS}
    }
  }
`;

export const SEVENX_CLASS_REMOVE = gql`
  mutation sevenxClassRemoveMutation($_id: String!) {
    sevenxClassRemove(_id: $_id)
  }
`;

export const SEVENX_CLASS_ADD_STUDENTS = gql`
  mutation sevenxClassAddStudentsMutation($_id: String!, $studentIds: [String!]!) {
    sevenxClassAddStudents(_id: $_id, studentIds: $studentIds) {
      ${CLASS_WITH_STUDENTS}
    }
  }
`;

export const SEVENX_CLASS_REMOVE_STUDENT = gql`
  mutation sevenxClassRemoveStudentMutation($_id: String!, $studentId: String!) {
    sevenxClassRemoveStudent(_id: $_id, studentId: $studentId) {
      ${CLASS_WITH_STUDENTS}
    }
  }
`;
