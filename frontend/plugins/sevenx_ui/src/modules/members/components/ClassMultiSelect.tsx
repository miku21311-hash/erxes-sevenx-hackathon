import { MultipleSelector, MultiSelectOption } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useClasses } from '~/modules/classes/hooks/useClasses';

interface ClassMultiSelectProps {
  value: string[];
  onChange: (classIds: string[]) => void;
  disabled?: boolean;
}

export const ClassMultiSelect = ({
  value,
  onChange,
  disabled,
}: ClassMultiSelectProps) => {
  const { t } = useTranslation('sevenx');
  const { classes, loading } = useClasses();

  const options = useMemo<MultiSelectOption[]>(
    () => classes.map((c) => ({ value: c._id, label: c.name })),
    [classes],
  );

  const selected = options.filter((option) => value.includes(option.value));

  return (
    <MultipleSelector
      value={selected}
      options={options}
      disabled={disabled || loading}
      placeholder={t('select-classes')}
      hidePlaceholderWhenSelected
      emptyIndicator={
        <p className="text-center text-sm text-muted-foreground py-2">
          {t('no-classes-title')}
        </p>
      }
      onChange={(next) => onChange(next.map((option) => option.value))}
    />
  );
};
