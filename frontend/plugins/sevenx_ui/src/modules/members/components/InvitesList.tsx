import { IconCheck, IconCopy, IconTrash } from '@tabler/icons-react';
import { Button, Skeleton, Table } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ISevenxInvite, SevenxRole } from '~/modules/shared/types';
import { QueryError } from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { formatDate } from '~/modules/shared/utils/schedule';
import { useInvites } from '../hooks/useInvites';
import { useMemberMutations } from '../hooks/useMemberMutations';

export const InvitesList = ({ role, classId }: { role?: SevenxRole; classId?: string }) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { invites, loading, error, refetch } = useInvites({ role, classId });
  const { removeInvite, loading: removing } = useMemberMutations();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (invite: ISevenxInvite) => {
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopiedId(invite._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async (invite: ISevenxInvite) => {
    try {
      await removeInvite(invite._id);
      toast.success(t('invite-removed'));
    } catch (err) {
      toast.error(err);
    }
  };

  if (error) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="px-3 pb-3">
      <h3 className="text-sm font-semibold text-muted-foreground px-1 py-2">
        {t('pending-invites')}
      </h3>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : invites.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1 py-2">
          {t('no-pending-invites')}
        </p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('email')}</Table.Head>
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head>{t('class-list')}</Table.Head>
              <Table.Head>{t('expires-at')}</Table.Head>
              <Table.Head className="w-32 text-right">{t('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {invites.map((invite) => (
              <Table.Row key={invite._id}>
                <Table.Cell>{invite.email}</Table.Cell>
                <Table.Cell>
                  {[invite.firstName, invite.lastName].filter(Boolean).join(' ') || '—'}
                </Table.Cell>
                <Table.Cell>{invite.classIds.length}</Table.Cell>
                <Table.Cell>{formatDate(invite.expiresAt)}</Table.Cell>
                <Table.Cell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copy(invite)}
                      aria-label={t('copy-link')}
                    >
                      {copiedId === invite._id ? <IconCheck /> : <IconCopy />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      disabled={removing}
                      onClick={() => remove(invite)}
                      aria-label={t('remove')}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};
