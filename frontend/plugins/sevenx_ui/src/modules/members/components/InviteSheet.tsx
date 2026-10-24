import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, Form, Input, Sheet } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ISevenxInvite, SevenxRole } from '~/modules/shared/types';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { InviteFormValues, useMemberMutations } from '../hooks/useMemberMutations';
import { ClassMultiSelect } from './ClassMultiSelect';

interface InviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: SevenxRole;
  defaultClassIds?: string[];
}

const EMPTY: InviteFormValues = {
  email: '',
  firstName: '',
  lastName: '',
  classIds: [],
};

export const InviteSheet = ({
  open,
  onOpenChange,
  role,
  defaultClassIds,
}: InviteSheetProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { createInvite, loading } = useMemberMutations();
  const [created, setCreated] = useState<ISevenxInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const schema = z.object({
    email: z.string().trim().min(1, t('field-required')).email(t('invalid-email')),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    classIds: z.array(z.string()),
  });

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, classIds: defaultClassIds ?? [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({ ...EMPTY, classIds: defaultClassIds ?? [] });
      setCreated(null);
      setCopied(false);
    }
  }, [open, defaultClassIds, form]);

  const onSubmit = async (values: InviteFormValues) => {
    try {
      const result = await createInvite(role, {
        ...values,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      });
      const invite = result.data?.sevenxInviteCreate;
      if (invite) {
        setCreated(invite);
        toast.success(t('invite-created'));
      }
    } catch (err) {
      toast.error(err);
    }
  };

  const copyUrl = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error(err);
    }
  };

  const title = role === 'teacher' ? t('invite-teacher') : t('invite-student');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg w-full p-0">
        {created ? (
          <div className="flex flex-col h-full">
            <Sheet.Header className="p-5">
              <Sheet.Title>{t('invite-created')}</Sheet.Title>
              <Sheet.Description>{t('invite-created-description')}</Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="px-5 py-4 flex flex-col gap-3 flex-1">
              <p className="text-sm text-muted-foreground">{created.email}</p>
              <label className="text-sm font-medium" htmlFor="sevenx-invite-url">
                {t('invite-url')}
              </label>
              <div className="flex gap-2">
                <Input id="sevenx-invite-url" value={created.url} readOnly />
                <Button type="button" variant="outline" onClick={copyUrl}>
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? t('copied') : t('copy-link')}
                </Button>
              </div>
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end gap-2 px-5">
              <Button type="button" onClick={() => onOpenChange(false)}>
                {t('done')}
              </Button>
            </Sheet.Footer>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col h-full"
            >
              <Sheet.Header className="p-5">
                <Sheet.Title>{title}</Sheet.Title>
                <Sheet.Description className="sr-only">{title}</Sheet.Description>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('email')}</Form.Label>
                      <Form.Control>
                        <Input {...field} type="email" autoFocus />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Form.Field
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('last-name')}</Form.Label>
                        <Form.Control>
                          <Input {...field} value={field.value ?? ''} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('first-name')}</Form.Label>
                        <Form.Control>
                          <Input {...field} value={field.value ?? ''} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Form.Field
                  control={form.control}
                  name="classIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {t('class-list')}{' '}
                        <span className="text-muted-foreground">({t('optional')})</span>
                      </Form.Label>
                      <Form.Control>
                        <ClassMultiSelect
                          value={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
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
                  {loading ? t('saving') : t('invite')}
                </Button>
              </Sheet.Footer>
            </form>
          </Form>
        )}
      </Sheet.View>
    </Sheet>
  );
};
