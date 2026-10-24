import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Input, PageSubHeader } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import {
  ConfirmRemoveDialog,
  QueryError,
  SevenxPageHeader,
} from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxMember, SevenxRole } from '~/modules/shared/types';
import { useMemberMutations } from '../hooks/useMemberMutations';
import { useMembers } from '../hooks/useMembers';
import { InviteSheet } from './InviteSheet';
import { InvitesList } from './InvitesList';
import { MembersTable } from './MembersTable';

interface MembersViewProps {
  memberRole: SevenxRole;
  icon: React.ElementType;
  iconName: string;
  title: string;
  path: string;
  emptyTitle: string;
}

export const MembersView = ({
  memberRole: role,
  icon,
  iconName,
  title,
  path,
  emptyTitle,
}: MembersViewProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 300);
  const { members, loading, error, refetch } = useMembers({
    role,
    searchValue: searchValue || undefined,
  });
  const { removeMember, loading: mutating } = useMemberMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<ISevenxMember | null>(null);

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeMember(removing._id);
      toast.success(t('member-removed'));
      setRemoving(null);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={icon} iconName={iconName} title={title} path={path}>
        <Button onClick={() => setInviteOpen(true)}>
          <IconPlus />
          {role === 'teacher' ? t('invite-teacher') : t('invite-student')}
        </Button>
      </SevenxPageHeader>
      <PageSubHeader>
        <div className="relative w-64">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageSubHeader>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <MembersTable
            members={members}
            loading={loading}
            emptyIcon={icon}
            emptyTitle={emptyTitle}
            onRemove={setRemoving}
            onInvite={() => setInviteOpen(true)}
            t={t}
          />
        )}
        <InvitesList role={role} />
      </div>
      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} role={role} />
      <ConfirmRemoveDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('remove-member')}
        loading={mutating}
      />
    </div>
  );
};
