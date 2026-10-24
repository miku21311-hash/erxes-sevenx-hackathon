import { Button, Dialog, MultipleSelector, MultiSelectOption } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMembers } from '~/modules/members/hooks/useMembers';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import { useClassMutations } from '../../hooks/useClassMutations';

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ISevenxClass;
}

export const AddStudentsDialog = ({ open, onOpenChange, classItem }: AddStudentsDialogProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { members, loading } = useMembers({ role: 'student' });
  const { addStudents, loading: saving } = useClassMutations();
  const [selected, setSelected] = useState<MultiSelectOption[]>([]);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const options = useMemo<MultiSelectOption[]>(
    () =>
      members
        .filter((m) => !classItem.studentIds.includes(m._id))
        .map((m) => ({ value: m._id, label: `${memberFullName(m)} (${m.email})` })),
    [members, classItem.studentIds],
  );

  const submit = async () => {
    if (selected.length === 0) return;
    try {
      await addStudents(
        classItem._id,
        selected.map((o) => o.value),
      );
      toast.success(t('students-added'));
      onOpenChange(false);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t('add-students')}</Dialog.Title>
          <Dialog.Description className="sr-only">{t('select-students')}</Dialog.Description>
        </Dialog.Header>
        <div className="py-2">
          <MultipleSelector
            value={selected}
            options={options}
            onChange={setSelected}
            disabled={loading}
            placeholder={t('select-students')}
            hidePlaceholderWhenSelected
            emptyIndicator={
              <p className="text-center text-sm text-muted-foreground py-2">
                {t('no-students-available')}
              </p>
            }
          />
        </div>
        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={submit} disabled={saving || selected.length === 0}>
            {saving ? t('saving') : t('add-selected')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
