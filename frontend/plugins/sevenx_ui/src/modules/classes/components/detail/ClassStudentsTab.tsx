import { IconPlus, IconTrash, IconUsers } from '@tabler/icons-react';
import { Badge, Button, Table } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmRemoveDialog, SevenxEmpty } from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxClass, ISevenxMember, memberFullName } from '~/modules/shared/types';
import { useClassMutations } from '../../hooks/useClassMutations';
import { AddStudentsDialog } from './AddStudentsDialog';

export const ClassStudentsTab = ({ classItem }: { classItem: ISevenxClass }) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { removeStudent, loading } = useClassMutations();
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<ISevenxMember | null>(null);

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeStudent(classItem._id, removing._id);
      toast.success(t('student-removed'));
      setRemoving(null);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <IconPlus />
          {t('add-students')}
        </Button>
      </div>
      {classItem.students.length === 0 ? (
        <SevenxEmpty icon={IconUsers} title={t('no-students-in-class')} />
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head>{t('email')}</Table.Head>
              <Table.Head>{t('phone')}</Table.Head>
              <Table.Head>{t('status')}</Table.Head>
              <Table.Head className="w-16 text-right">{t('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {classItem.students.map((student) => (
              <Table.Row key={student._id}>
                <Table.Cell className="font-medium">{memberFullName(student)}</Table.Cell>
                <Table.Cell>{student.email}</Table.Cell>
                <Table.Cell>{student.phone ?? '—'}</Table.Cell>
                <Table.Cell>
                  <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                    {student.status === 'active' ? t('active') : t('invited')}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    aria-label={t('remove-student')}
                    onClick={() => setRemoving(student)}
                  >
                    <IconTrash />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <AddStudentsDialog open={addOpen} onOpenChange={setAddOpen} classItem={classItem} />
      <ConfirmRemoveDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('remove-student')}
        loading={loading}
      />
    </div>
  );
};
