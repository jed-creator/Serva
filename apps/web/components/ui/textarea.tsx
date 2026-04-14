import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500',
          'aria-invalid:border-red-500 aria-invalid:ring-red-500',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
