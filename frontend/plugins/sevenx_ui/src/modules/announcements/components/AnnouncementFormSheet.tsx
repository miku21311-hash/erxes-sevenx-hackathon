import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Select, Sheet, Textarea } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useClasses } from '~/modules/classes/hooks/useClasses';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import {
  AnnouncementFormValues,
  useAnnouncementMutations,
} from '../hooks/useAnnouncementMutations';

const defaultAnnouncement = (fixedClassId?: string): AnnouncementFormValues => ({
  scope: fixedClassId ? 'class' : 'all',
  classId: fixedClassId ?? '',
  title: '',
  body: '',
});

interface AnnouncementFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the announcement is always for this class. */
  fixedClassId?: string;
}

export const AnnouncementFormSheet = ({
  open,
  onOpenChange,
  fixedClassId,
}: AnnouncementFormSheetProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { addAnnouncement, loading } = useAnnouncementMutations();
  const { classes, loading: classesLoading } = useClasses();

  const schema = z
    .object({
      scope: z.enum(['all', 'class']),
      classId: z.string().optional(),
      title: z.string().trim().min(1, t('field-required')),
      body: z.string().trim().min(1, t('field-required')),
    })
    .refine((v) => v.scope === 'all' || !!v.classId, {
      message: t('class-required'),
      path: ['classId'],
    });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultAnnouncement(fixedClassId),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultAnnouncement(fixedClassId));
    }
  }, [open, fixedClassId, form]);

  const scope = form.watch('scope');

  const onSubmit = async (values: AnnouncementFormValues) => {
    try {
      await addAnnouncement(values);
      toast.success(t('announcement-created'));
      onOpenChange(false);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg w-full p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <Sheet.Header className="p-5">
              <Sheet.Title>{t('add-announcement')}</Sheet.Title>
              <Sheet.Description className="sr-only">{t('announcements')}</Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
              {!fixedClassId && (
                <Form.Field
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('scope')}</Form.Label>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <Form.Control>
                          <Select.Trigger className="border border-input">
                            <Select.Value />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          <Select.Item value="all">{t('scope-all')}</Select.Item>
                          <Select.Item value="class">{t('scope-class')}</Select.Item>
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
              {!fixedClassId && scope === 'class' && (
                <Form.Field
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('classes')}</Form.Label>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={classesLoading}
                      >
                        <Form.Control>
                          <Select.Trigger className="border border-input">
                            <Select.Value placeholder={t('select-class')} />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {classes.map((c) => (
                            <Select.Item key={c._id} value={c._id}>
                              {c.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
              <Form.Field
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('title')}</Form.Label>
                    <Form.Control>
                      <Input {...field} autoFocus />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="body"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('body')}</Form.Label>
                    <Form.Control>
                      <Textarea {...field} rows={6} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end gap-2 px-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('saving') : t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
