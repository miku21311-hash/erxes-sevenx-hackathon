import { ApolloCache, useMutation } from '@apollo/client';
import {
  SEVENX_ANNOUNCEMENT_ADD,
  SEVENX_ANNOUNCEMENT_REMOVE,
} from '../graphql/mutations';
import { ISevenxAnnouncement, SevenxAnnouncementScope } from '~/modules/shared/types';

export interface AnnouncementFormValues {
  scope: SevenxAnnouncementScope;
  classId?: string;
  title: string;
  body: string;
}

const evictAnnouncementLists = {
  update: (cache: ApolloCache<unknown>) => {
    cache.evict({ id: 'ROOT_QUERY', fieldName: 'sevenxAnnouncements' });
    cache.gc();
  },
};

export const useAnnouncementMutations = () => {
  const [addMutation, { loading: adding }] = useMutation<{
    sevenxAnnouncementAdd: ISevenxAnnouncement;
  }>(SEVENX_ANNOUNCEMENT_ADD, evictAnnouncementLists);

  const [removeMutation, { loading: removing }] = useMutation<{
    sevenxAnnouncementRemove: string;
  }>(SEVENX_ANNOUNCEMENT_REMOVE, evictAnnouncementLists);

  return {
    addAnnouncement: (values: AnnouncementFormValues) =>
      addMutation({
        variables: {
          ...values,
          classId: values.scope === 'class' ? values.classId : undefined,
        },
      }),
    removeAnnouncement: (_id: string) => removeMutation({ variables: { _id } }),
    loading: adding || removing,
  };
};
