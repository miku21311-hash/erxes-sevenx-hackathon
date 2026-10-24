import {
  IconBook2,
  IconDotsVertical,
  IconMail,
  IconPhone,
  IconProgressCheck,
  IconTrash,
  IconUser,
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
import { ISevenxMember, memberFullName } from '~/modules/shared/types';
import { SevenxEmpty } from '~/modules/shared/components';

interface MembersTableProps {
  members: ISevenxMember[];
  loading: boolean;
  emptyIcon: React.ElementType;
  emptyTitle: string;
  onRemove: (member: ISevenxMember) => void;
  onInvite: () => void;
  t: TFunction;
}

const buildColumns = (
  t: TFunction,
  onRemove: (member: ISevenxMember) => void,
): ColumnDef<ISevenxMember>[] => [
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
          <DropdownMenu.Item
            className="text-destructive"
            onSelect={() => onRemove(row.original)}
          >
            <IconTrash size={16} />
            {t('remove-member')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ),
  },
  {
    id: 'name',
    accessorFn: (row) => memberFullName(row),
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('name')} />,
    size: 220,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconMail} label={t('email')} />,
    size: 240,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue<string>()} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label={t('phone')} />,
    size: 160,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<string | null>() ?? '—'}</RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconProgressCheck} label={t('status')} />
    ),
    size: 120,
    cell: ({ cell }) => {
      const status = cell.getValue<ISevenxMember['status']>();
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'success' : 'warning'}>
            {status === 'active' ? t('active') : t('invited')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'classIds',
    accessorFn: (row) => row.classIds.length,
    header: () => <RecordTable.InlineHead icon={IconBook2} label={t('class-list')} />,
    size: 100,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue<number>()}</RecordTableInlineCell>
    ),
  },
];

export const MembersTable = ({
  members,
  loading,
  emptyIcon,
  emptyTitle,
  onRemove,
  onInvite,
  t,
}: MembersTableProps) => {
  if (!loading && members.length === 0) {
    return (
      <SevenxEmpty
        icon={emptyIcon}
        title={emptyTitle}
        description={t('no-members-description')}
        className="h-full"
      >
        <Button onClick={onInvite}>{t('invite')}</Button>
      </SevenxEmpty>
    );
  }

  return (
    <RecordTable.Provider
      columns={buildColumns(t, onRemove)}
      data={members}
      className="m-3"
      stickyColumns={['more', 'name']}
      tableId="sevenx_members_table"
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
