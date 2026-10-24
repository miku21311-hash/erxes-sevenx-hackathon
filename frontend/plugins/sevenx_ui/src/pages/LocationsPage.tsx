import { IconMapPin, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationFormSheet } from '~/modules/locations/components/LocationFormSheet';
import { LocationsTable } from '~/modules/locations/components/LocationsTable';
import { useLocationMutations } from '~/modules/locations/hooks/useLocationMutations';
import { useLocations } from '~/modules/locations/hooks/useLocations';
import {
  ConfirmRemoveDialog,
  QueryError,
  SevenxPageHeader,
} from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxLocation } from '~/modules/shared/types';

export const LocationsPage = () => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { locations, loading, error, refetch } = useLocations();
  const { removeLocation, loading: mutating } = useLocationMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ISevenxLocation | null>(null);
  const [removing, setRemoving] = useState<ISevenxLocation | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (location: ISevenxLocation) => {
    setEditing(location);
    setFormOpen(true);
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeLocation(removing._id);
      toast.success(t('location-removed'));
      setRemoving(null);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader
        icon={IconMapPin}
        iconName="IconMapPin"
        title={t('locations')}
        path="/sevenx/locations"
      >
        <Button onClick={openCreate}>
          <IconPlus />
          {t('add-location')}
        </Button>
      </SevenxPageHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <LocationsTable
            locations={locations}
            loading={loading}
            onEdit={openEdit}
            onRemove={setRemoving}
            onAdd={openCreate}
            t={t}
          />
        )}
      </div>
      <LocationFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        location={editing}
      />
      <ConfirmRemoveDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('remove-location')}
        loading={mutating}
      />
    </div>
  );
};
