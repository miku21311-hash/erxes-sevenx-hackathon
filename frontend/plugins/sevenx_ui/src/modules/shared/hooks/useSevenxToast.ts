import { useToast } from 'erxes-ui';
import { useCallback } from 'react';

/** Success / error feedback with the plugin's common wording. */
export const useSevenxToast = () => {
  const { toast } = useToast();

  const success = useCallback(
    (title: string) => toast({ title, variant: 'success' }),
    [toast],
  );

  const error = useCallback(
    (err: unknown) =>
      toast({
        title: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      }),
    [toast],
  );

  return { success, error };
};
