import { IconBook2, IconPlus } from '@tabler/icons-react';
import { Button, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { ClassesFilter } from '~/modules/classes/components/ClassesFilter';
import { ClassesTable } from '~/modules/classes/components/ClassesTable';
import { ClassFormSheet } from '~/modules/classes/components/ClassFormSheet';
import { useClasses } from '~/modules/classes/hooks/useClasses';
import { useClassMutations } from '~/modules/classes/hooks/useClassMutations';
import {
  ConfirmRemoveDialog,
  QueryError,
  SevenxPageHeader,
} from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxClass } from '~/modules/shared/types';

export const ClassesPage = () => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const [{ locationId, teacherId }, setQuery] = useMultiQueryState<{
    locationId: string;
    teacherId: string;
  }>(['locationId', 'teacherId']);
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 300);

  const { classes, loading, error, refetch } = useClasses({
    locationId: locationId ?? undefined,
    teacherId: teacherId ?? undefined,
    searchValue: searchValue || undefined,
  });
  const { removeClass, loading: mutating } = useClassMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ISevenxClass | null>(null);
  const [removing, setRemoving] = useState<ISevenxClass | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (classItem: ISevenxClass) => {
    setEditing(classItem);
    setFormOpen(true);
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeClass(removing._id);
      toast.success(t('class-removed'));
      setRemoving(null);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={IconBook2} iconName="IconBook2" title={t('classes')} path="/sevenx/classes">
        <Button onClick={openCreate}>
          <IconPlus />
          {t('add-class')}
        </Button>
      </SevenxPageHeader>
      <ClassesFilter
        locationId={locationId ?? undefined}
        teacherId={teacherId ?? undefined}
        search={search}
        onLocationChange={(value) => setQuery({ locationId: value ?? null })}
        onTeacherChange={(value) => setQuery({ teacherId: value ?? null })}
        onSearchChange={setSearch}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <ClassesTable
            classes={classes}
            loading={loading}
            onEdit={openEdit}
            onRemove={setRemoving}
            onAdd={openCreate}
            t={t}
          />
        )}
      </div>
      <ClassFormSheet open={formOpen} onOpenChange={setFormOpen} classItem={editing} />
      <ConfirmRemoveDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('remove-class')}
        loading={mutating}
      />
    </div>
  );
};
