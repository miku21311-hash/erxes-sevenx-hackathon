import { useQuery } from '@apollo/client';
import { useDebounce } from 'use-debounce';
import { SEVENX_SCHEDULE_CONFLICTS } from '../graphql/queries';
import { ISevenxClassInput, ISevenxScheduleConflict } from '~/modules/shared/types';

interface ConflictsResponse {
  sevenxScheduleConflicts: ISevenxScheduleConflict[];
}

export const useScheduleConflicts = (
  input: ISevenxClassInput | null,
  excludeClassId?: string,
) => {
  const [inputKey] = useDebounce(input ? JSON.stringify(input) : '', 500);
  const debouncedInput = inputKey
    ? (JSON.parse(inputKey) as ISevenxClassInput)
    : null;

  const { data, loading, error } = useQuery<ConflictsResponse>(
    SEVENX_SCHEDULE_CONFLICTS,
    {
      variables: { input: debouncedInput, excludeClassId },
      skip: !debouncedInput,
      fetchPolicy: 'network-only',
    },
  );

  return {
    conflicts: debouncedInput ? data?.sevenxScheduleConflicts ?? [] : [],
    checking: loading || (!!input && inputKey !== JSON.stringify(input)),
    error,
  };
};
