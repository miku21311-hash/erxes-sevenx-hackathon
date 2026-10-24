import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const QueryError = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => {
  const { t } = useTranslation('sevenx');

  return (
    <Empty className="h-full">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle />
        </Empty.Media>
        <Empty.Title>{t('error-title')}</Empty.Title>
        <Empty.Description>{message || t('error-description')}</Empty.Description>
      </Empty.Header>
      {onRetry && (
        <Empty.Content>
          <Button variant="outline" onClick={onRetry}>
            {t('retry')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
