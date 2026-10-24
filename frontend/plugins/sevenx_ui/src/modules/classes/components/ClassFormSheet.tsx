import { Sheet } from 'erxes-ui';
import { ISevenxClass } from '~/modules/shared/types';
import { ClassForm } from './ClassForm';

interface ClassFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem?: ISevenxClass | null;
  onSaved?: (classItem: ISevenxClass) => void;
}

export const ClassFormSheet = ({
  open,
  onOpenChange,
  classItem,
  onSaved,
}: ClassFormSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <Sheet.View className="sm:max-w-2xl w-full p-0">
      {open && (
        <ClassForm
          classItem={classItem}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      )}
    </Sheet.View>
  </Sheet>
);
