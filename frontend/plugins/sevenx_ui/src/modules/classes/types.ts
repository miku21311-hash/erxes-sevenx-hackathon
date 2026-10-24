import type { TFunction } from 'i18next';
import { z } from 'zod';
import { ISevenxClass, ISevenxClassInput } from '~/modules/shared/types';
import { timeToMinutes } from '~/modules/shared/utils/schedule';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

export const buildClassFormSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().trim().min(1, t('field-required')),
      description: z.string().optional(),
      teacherId: z.string().min(1, t('field-required')),
      locationId: z.string().min(1, t('field-required')),
      room: z.string().optional(),
      daysOfWeek: z.array(z.number()).min(1, t('select-days')),
      startTime: z.string().regex(TIME_PATTERN, t('field-required')),
      endTime: z.string().regex(TIME_PATTERN, t('field-required')),
      startDate: z.date({ required_error: t('field-required') }),
      endDate: z.date({ required_error: t('field-required') }),
    })
    .refine((v) => timeToMinutes(v.endTime) > timeToMinutes(v.startTime), {
      message: t('time-order-invalid'),
      path: ['endTime'],
    })
    .refine((v) => v.endDate.getTime() >= v.startDate.getTime(), {
      message: t('date-order-invalid'),
      path: ['endDate'],
    });

export type ClassFormValues = z.infer<ReturnType<typeof buildClassFormSchema>>;

export const classToFormValues = (
  classItem?: ISevenxClass | null,
): Partial<ClassFormValues> => ({
  name: classItem?.name ?? '',
  description: classItem?.description ?? '',
  teacherId: classItem?.teacherId ?? '',
  locationId: classItem?.locationId ?? '',
  room: classItem?.room ?? '',
  daysOfWeek: classItem?.schedule.daysOfWeek ?? [],
  startTime: classItem?.schedule.startTime ?? '18:00',
  endTime: classItem?.schedule.endTime ?? '19:30',
  startDate: classItem ? new Date(classItem.schedule.startDate) : undefined,
  endDate: classItem ? new Date(classItem.schedule.endDate) : undefined,
});

export const formValuesToInput = (
  values: ClassFormValues,
  studentIds?: string[],
): ISevenxClassInput => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
  teacherId: values.teacherId,
  locationId: values.locationId,
  room: values.room || undefined,
  studentIds,
  schedule: {
    daysOfWeek: [...values.daysOfWeek].sort((a, b) => a - b),
    startTime: values.startTime,
    endTime: values.endTime,
    startDate: values.startDate.toISOString(),
    endDate: values.endDate.toISOString(),
  },
});

/** Input for the live conflict check, or null while the form is incomplete. */
export const partialValuesToInput = (
  values: Partial<ClassFormValues>,
): ISevenxClassInput | null => {
  if (
    !values.teacherId ||
    !values.locationId ||
    !values.daysOfWeek?.length ||
    !values.startTime ||
    !values.endTime ||
    !TIME_PATTERN.test(values.startTime) ||
    !TIME_PATTERN.test(values.endTime) ||
    !(values.startDate instanceof Date) ||
    !(values.endDate instanceof Date)
  ) {
    return null;
  }

  return formValuesToInput({
    name: values.name || '-',
    description: values.description,
    teacherId: values.teacherId,
    locationId: values.locationId,
    room: values.room,
    daysOfWeek: values.daysOfWeek,
    startTime: values.startTime,
    endTime: values.endTime,
    startDate: values.startDate,
    endDate: values.endDate,
  });
};
