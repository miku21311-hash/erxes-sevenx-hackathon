import {
  IconDoor,
  IconDotsVertical,
  IconEdit,
  IconLabelFilled,
  IconMapPin,
  IconTrash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  DropdownMenu,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { ISevenxLocation } from '~/modules/shared/types';
import { SevenxEmpty } from '~/modules/shared/components';

interface LocationsTableProps {
  locations: ISevenxLocation[];
  loading: boolean;
  onEdit: (location: ISevenxLocation) => void;
  onRemove: (location: ISevenxLocation) => void;
  onAdd: () => void;
  t: TFunction;
}

const buildColumns = ({
  onEdit,
  onRemove,
  t,
}: Pick<LocationsTableProps, 'onEdit' | 'onRemove' | 't'>): ColumnDef<ISevenxLocation>[] => [
  {
    id: 'more',
    size: 36,
    header: () => null,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-full">
            <IconDotsVertical size={16} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
          <DropdownMenu.Item onSelect={() => onEdit(row.original)}>
            <IconEdit size={16} />
            {t('edit')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-destructive"
            onSelect={() => onRemove(row.original)}
          >
            <IconTrash size={16} />
            {t('remove')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label={t('name')} />,
    size: 240,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: () => <RecordTable.InlineHead icon={IconMapPin} label={t('address')} />,
    size: 280,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string | null>() ?? '—'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'rooms',
    accessorKey: 'rooms',
    header: () => <RecordTable.InlineHead icon={IconDoor} label={t('rooms')} />,
    size: 320,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="gap-1 flex-wrap">
        {cell.getValue<string[]>().map((room) => (
          <Badge key={room} variant="secondary">
            {room}
          </Badge>
        ))}
      </RecordTableInlineCell>
    ),
  },
];

export const LocationsTable = ({
  locations,
  loading,
  onEdit,
  onRemove,
  onAdd,
  t,
}: LocationsTableProps) => {
  if (!loading && locations.length === 0) {
    return (
      <SevenxEmpty
        icon={IconMapPin}
        title={t('no-locations-title')}
        description={t('no-locations-description')}
        className="h-full"
      >
        <Button onClick={onAdd}>{t('add-location')}</Button>
      </SevenxEmpty>
    );
  }

  return (
    <RecordTable.Provider
      columns={buildColumns({ onEdit, onRemove, t })}
      data={locations}
      className="m-3"
      stickyColumns={['more', 'name']}
      tableId="sevenx_locations_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={8} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
