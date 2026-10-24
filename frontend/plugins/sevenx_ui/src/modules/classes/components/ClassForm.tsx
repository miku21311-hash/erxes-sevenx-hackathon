import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Label,
  Select,
  Sheet,
  Textarea,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocations } from '~/modules/locations/hooks/useLocations';
import { useMembers } from '~/modules/members/hooks/useMembers';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { WEEK_DAYS } from '~/modules/shared/utils/schedule';
import { useClassMutations } from '../hooks/useClassMutations';
import { useScheduleConflicts } from '../hooks/useScheduleConflicts';
import {
  buildClassFormSchema,
  ClassFormValues,
  classToFormValues,
  formValuesToInput,
  partialValuesToInput,
} from '../types';
import { ScheduleConflicts } from './ScheduleConflicts';

interface ClassFormProps {
  classItem?: ISevenxClass | null;
  onClose: () => void;
  onSaved?: (classItem: ISevenxClass) => void;
}

export const ClassForm = ({ classItem, onClose, onSaved }: ClassFormProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { addClass, editClass, loading } = useClassMutations();
  const { members: teachers, loading: teachersLoading } = useMembers({ role: 'teacher' });
  const { locations, loading: locationsLoading } = useLocations();

  const schema = useMemo(() => buildClassFormSchema(t), [t]);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(schema),
    defaultValues: classToFormValues(classItem),
  });

  useEffect(() => {
    form.reset(classToFormValues(classItem));
  }, [classItem, form]);

  const watched = form.watch();
  const conflictInput = partialValuesToInput(watched);
  const { conflicts, checking } = useScheduleConflicts(conflictInput, classItem?._id);

  const selectedLocation = locations.find((l) => l._id === watched.locationId);
  const rooms = selectedLocation?.rooms ?? [];

  const onSubmit = async (values: ClassFormValues) => {
    try {
      const input = formValuesToInput(values, classItem?.studentIds);
      const result = classItem
        ? await editClass(classItem._id, input)
        : await addClass(input);
      const saved =
        result.data && 'sevenxClassEdit' in result.data
          ? result.data.sevenxClassEdit
          : result.data && 'sevenxClassAdd' in result.data
          ? result.data.sevenxClassAdd
          : null;
      toast.success(t('class-saved'));
      if (saved) onSaved?.(saved);
      onClose();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <Sheet.Header className="p-5">
          <Sheet.Title>{classItem ? t('edit-class') : t('add-class')}</Sheet.Title>
          <Sheet.Description className="sr-only">{t('classes')}</Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('class-name')}</Form.Label>
                <Form.Control>
                  <Input {...field} autoFocus />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('description')}{' '}
                  <span className="text-muted-foreground">({t('optional')})</span>
                </Form.Label>
                <Form.Control>
                  <Textarea {...field} value={field.value ?? ''} rows={3} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('teacher')}</Form.Label>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={teachersLoading}
                >
                  <Form.Control>
                    <Select.Trigger className="border border-input">
                      <Select.Value placeholder={t('select-teacher')} />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {teachers.map((teacher) => (
                      <Select.Item key={teacher._id} value={teacher._id}>
                        {memberFullName(teacher)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <Form.Field
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('location')}</Form.Label>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('room', '');
                    }}
                    disabled={locationsLoading}
                  >
                    <Form.Control>
                      <Select.Trigger className="border border-input">
                        <Select.Value placeholder={t('select-location')} />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {locations.map((location) => (
                        <Select.Item key={location._id} value={location._id}>
                          {location.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="room"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('room')}{' '}
                    <span className="text-muted-foreground">({t('optional')})</span>
                  </Form.Label>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={rooms.length === 0}
                  >
                    <Form.Control>
                      <Select.Trigger className="border border-input">
                        <Select.Value placeholder={t('select-room')} />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {rooms.map((room) => (
                        <Select.Item key={room} value={room}>
                          {room}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            control={form.control}
            name="daysOfWeek"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('days-of-week')}</Form.Label>
                <div className="flex flex-wrap gap-3">
                  {WEEK_DAYS.map((day) => {
                    const id = `sevenx-day-${day}`;
                    const checked = field.value.includes(day);
                    return (
                      <div key={day} className="flex items-center gap-1.5">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(next) =>
                            field.onChange(
                              next
                                ? [...field.value, day]
                                : field.value.filter((d) => d !== day),
                            )
                          }
                        />
                        <Label htmlFor={id} className="text-sm font-normal">
                          {t(`day-${day}`)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <Form.Field
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('start-time')}</Form.Label>
                  <Form.Control>
                    <Input {...field} type="time" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('end-time')}</Form.Label>
                  <Form.Control>
                    <Input {...field} type="time" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Field
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>{t('start-date')}</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      mode="single"
                      variant="outline"
                      onChange={(date) =>
                        field.onChange(date instanceof Date ? date : undefined)
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <Form.Item className="flex flex-col">
                  <Form.Label>{t('end-date')}</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      mode="single"
                      variant="outline"
                      onChange={(date) =>
                        field.onChange(date instanceof Date ? date : undefined)
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <ScheduleConflicts
            conflicts={conflicts}
            checking={checking}
            ready={!!conflictInput}
          />
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end gap-2 px-5">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading || conflicts.length > 0}>
            {loading ? t('saving') : t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
