import {
  IconBook2,
  IconCalendarEvent,
  IconChalkboard,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconMapPin,
  IconProgressCheck,
  IconTrash,
  IconUsers,
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
import { Link } from 'react-router-dom';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import { SevenxEmpty } from '~/modules/shared/components';
import { formatDateTime, scheduleLabel } from '~/modules/shared/utils/schedule';

interface ClassesTableProps {
  classes: ISevenxClass[];
  loading: boolean;
  onEdit: (classItem: ISevenxClass) => void;
  onRemove: (classItem: ISevenxClass) => void;
  onAdd: () => void;
  t: TFunction;
}

const buildColumns = (
  t: TFunction,
  onEdit: (c: ISevenxClass) => void,
  onRemove: (c: ISevenxClass) => void,
): ColumnDef<ISevenxClass>[] => [
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
    header: () => <RecordTable.InlineHead icon={IconBook2} label={t('name')} />,
    size: 240,
    cell: ({ cell, row }) => (
      <RecordTableInlineCell>
        <Link
          to={`/sevenx/classes/${row.original._id}`}
          className="text-primary hover:underline truncate"
        >
          {cell.getValue<string>()}
        </Link>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'teacher',
    accessorFn: (row) => memberFullName(row.teacher),
    header: () => <RecordTable.InlineHead icon={IconChalkboard} label={t('teacher')} />,
    size: 180,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>() || '—'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'location',
    accessorFn: (row) =>
      [row.location?.name, row.room].filter(Boolean).join(' · ') || '—',
    header: () => <RecordTable.InlineHead icon={IconMapPin} label={t('location')} />,
    size: 200,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'schedule',
    accessorFn: (row) => scheduleLabel(row.schedule, (day) => t(`day-${day}`)),
    header: () => <RecordTable.InlineHead icon={IconClock} label={t('schedule')} />,
    size: 220,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'students',
    accessorFn: (row) => row.studentIds.length,
    header: () => <RecordTable.InlineHead icon={IconUsers} label={t('students-count')} />,
    size: 100,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<number>()}</RecordTableInlineCell>
    ),
  },
  {
    id: 'nextSession',
    accessorFn: (row) => formatDateTime(row.nextSession),
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarEvent} label={t('next-session')} />
    ),
    size: 160,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<string>() || '—'}</RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconProgressCheck} label={t('status')} />,
    size: 110,
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status === 'active' ? t('active') : t('archived')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
];

export const ClassesTable = ({
  classes,
  loading,
  onEdit,
  onRemove,
  onAdd,
  t,
}: ClassesTableProps) => {
  if (!loading && classes.length === 0) {
    return (
      <SevenxEmpty
        icon={IconBook2}
        title={t('no-classes-title')}
        description={t('no-classes-description')}
        className="h-full"
      >
        <Button onClick={onAdd}>{t('add-class')}</Button>
      </SevenxEmpty>
    );
  }

  return (
    <RecordTable.Provider
      columns={buildColumns(t, onEdit, onRemove)}
      data={classes}
      className="m-3"
      stickyColumns={['more', 'name']}
      tableId="sevenx_classes_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={10} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
