import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, StringArrayInput } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ISevenxLocation } from '~/modules/shared/types';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import {
  LocationFormValues,
  useLocationMutations,
} from '../hooks/useLocationMutations';

interface LocationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: ISevenxLocation | null;
}

const toValues = (location?: ISevenxLocation | null): LocationFormValues => ({
  name: location?.name ?? '',
  address: location?.address ?? '',
  rooms: location?.rooms ?? [],
});

export const LocationFormSheet = ({
  open,
  onOpenChange,
  location,
}: LocationFormSheetProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { addLocation, editLocation, loading } = useLocationMutations();

  const schema = z.object({
    name: z.string().trim().min(1, t('field-required')),
    address: z.string().optional(),
    rooms: z.array(z.string()),
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toValues(location),
  });

  useEffect(() => {
    if (open) {
      form.reset(toValues(location));
    }
  }, [open, location, form]);

  const onSubmit = async (values: LocationFormValues) => {
    try {
      if (location) {
        await editLocation(location._id, values);
      } else {
        await addLocation(values);
      }
      toast.success(t('location-saved'));
      onOpenChange(false);
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg w-full p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header className="p-5">
              <Sheet.Title>
                {location ? t('edit-location') : t('add-location')}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                {t('locations')}
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="px-5 py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} autoFocus />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="address"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('address')}{' '}
                      <span className="text-muted-foreground">
                        ({t('optional')})
                      </span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} value={field.value ?? ''} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('rooms')}</Form.Label>
                    <Form.Control>
                      <StringArrayInput
                        id="sevenx-location-rooms"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('rooms-placeholder')}
                        styleClasses={{
                          inlineTagsContainer: 'border border-input',
                        }}
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
                {loading ? t('saving') : t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
