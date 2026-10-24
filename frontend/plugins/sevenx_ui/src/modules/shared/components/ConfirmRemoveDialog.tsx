import { AlertDialog, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface ConfirmRemoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export const ConfirmRemoveDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading,
}: ConfirmRemoveDialogProps) => {
  const { t } = useTranslation('sevenx');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{title || t('confirm-remove-title')}</AlertDialog.Title>
          <AlertDialog.Description>
            {description || t('confirm-remove-description')}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button variant="outline" disabled={loading}>
              {t('cancel')}
            </Button>
          </AlertDialog.Cancel>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {t('yes-remove')}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
