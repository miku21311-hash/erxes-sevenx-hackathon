import { useMutation } from '@apollo/client';
import {
  SEVENX_LOCATION_ADD,
  SEVENX_LOCATION_EDIT,
  SEVENX_LOCATION_REMOVE,
} from '../graphql/mutations';
import { SEVENX_LOCATIONS } from '../graphql/queries';
import { ISevenxLocation } from '~/modules/shared/types';

export interface LocationFormValues {
  name: string;
  address?: string;
  rooms: string[];
}

export const useLocationMutations = () => {
  const refetchQueries = [{ query: SEVENX_LOCATIONS }];

  const [addMutation, { loading: adding }] = useMutation<{
    sevenxLocationAdd: ISevenxLocation;
  }>(SEVENX_LOCATION_ADD, { refetchQueries });

  const [editMutation, { loading: editing }] = useMutation<{
    sevenxLocationEdit: ISevenxLocation;
  }>(SEVENX_LOCATION_EDIT, { refetchQueries });

  const [removeMutation, { loading: removing }] = useMutation<{
    sevenxLocationRemove: string;
  }>(SEVENX_LOCATION_REMOVE, { refetchQueries });

  const addLocation = (values: LocationFormValues) =>
    addMutation({ variables: values });

  const editLocation = (_id: string, values: LocationFormValues) =>
    editMutation({ variables: { _id, ...values } });

  const removeLocation = (_id: string) => removeMutation({ variables: { _id } });

  return {
    addLocation,
    editLocation,
    removeLocation,
    loading: adding || editing || removing,
  };
};
