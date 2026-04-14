import * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500',
          'aria-invalid:border-red-500 aria-invalid:ring-red-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';

export { Select };
