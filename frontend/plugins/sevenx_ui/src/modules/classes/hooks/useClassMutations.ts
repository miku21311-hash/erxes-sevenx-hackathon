import { ApolloCache, useMutation } from '@apollo/client';
import {
  SEVENX_CLASS_ADD,
  SEVENX_CLASS_ADD_STUDENTS,
  SEVENX_CLASS_EDIT,
  SEVENX_CLASS_REMOVE,
  SEVENX_CLASS_REMOVE_STUDENT,
} from '../graphql/mutations';
import { ISevenxClass, ISevenxClassInput } from '~/modules/shared/types';

/** Every class mutation re-reads the class lists (filters vary, so evict). */
const evictClassLists = {
  update: (cache: ApolloCache<unknown>) => {
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxClasses' });
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxDashboardStats' });
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxMembers' });
    cache.gc();
  },
};

export const useClassMutations = () => {
  const [addMutation, { loading: adding }] = useMutation<{
    sevenxClassAdd: ISevenxClass;
  }>(SEVENX_CLASS_ADD, evictClassLists);

  const [editMutation, { loading: editing }] = useMutation<{
    sevenxClassEdit: ISevenxClass;
  }>(SEVENX_CLASS_EDIT, evictClassLists);

  const [removeMutation, { loading: removing }] = useMutation<{
    sevenxClassRemove: string;
  }>(SEVENX_CLASS_REMOVE, evictClassLists);

  const [addStudentsMutation, { loading: addingStudents }] = useMutation<{
    sevenxClassAddStudents: ISevenxClass;
  }>(SEVENX_CLASS_ADD_STUDENTS, evictClassLists);

  const [removeStudentMutation, { loading: removingStudent }] = useMutation<{
    sevenxClassRemoveStudent: ISevenxClass;
  }>(SEVENX_CLASS_REMOVE_STUDENT, evictClassLists);

  return {
    addClass: (input: ISevenxClassInput) => addMutation({ variables: { input } }),
    editClass: (_id: string, input: ISevenxClassInput) =>
      editMutation({ variables: { _id, input } }),
    removeClass: (_id: string) => removeMutation({ variables: { _id } }),
    addStudents: (_id: string, studentIds: string[]) =>
      addStudentsMutation({ variables: { _id, studentIds } }),
    removeStudent: (_id: string, studentId: string) =>
      removeStudentMutation({ variables: { _id, studentId } }),
    loading: adding || editing || removing || addingStudents || removingStudent,
  };
};
