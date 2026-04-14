'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'disabled'> {
  pendingLabel?: string;
}

/**
 * Button that auto-disables and shows a spinner while its parent <form> is
 * pending a server action. Must be used inside a <form>.
 */
export function SubmitButton({
  children,
  pendingLabel = 'Please wait…',
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
