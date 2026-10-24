import { IconSearch } from '@tabler/icons-react';
import { Input, PageSubHeader, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocations } from '~/modules/locations/hooks/useLocations';
import { useMembers } from '~/modules/members/hooks/useMembers';
import { memberFullName } from '~/modules/shared/types';

const ALL = 'all';

interface ClassesFilterProps {
  locationId?: string;
  teacherId?: string;
  search?: string;
  onLocationChange: (locationId?: string) => void;
  onTeacherChange?: (teacherId?: string) => void;
  onSearchChange?: (value: string) => void;
}

export const ClassesFilter = ({
  locationId,
  teacherId,
  search,
  onLocationChange,
  onTeacherChange,
  onSearchChange,
}: ClassesFilterProps) => {
  const { t } = useTranslation('sevenx');
  const { locations } = useLocations();
  const { members: teachers } = useMembers({ role: 'teacher' });

  return (
    <PageSubHeader className="items-center">
      {onSearchChange && (
        <div className="relative w-56">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('search')}
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <Select
        value={locationId ?? ALL}
        onValueChange={(value) => onLocationChange(value === ALL ? undefined : value)}
      >
        <Select.Trigger className="w-48 border border-input">
          <Select.Value placeholder={t('filter-location')} />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={ALL}>
            {t('filter-location')}: {t('all')}
          </Select.Item>
          {locations.map((location) => (
            <Select.Item key={location._id} value={location._id}>
              {location.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {onTeacherChange && (
        <Select
          value={teacherId ?? ALL}
          onValueChange={(value) => onTeacherChange(value === ALL ? undefined : value)}
        >
          <Select.Trigger className="w-48 border border-input">
            <Select.Value placeholder={t('filter-teacher')} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ALL}>
              {t('filter-teacher')}: {t('all')}
            </Select.Item>
            {teachers.map((teacher) => (
              <Select.Item key={teacher._id} value={teacher._id}>
                {memberFullName(teacher)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    </PageSubHeader>
  );
};
