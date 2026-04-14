import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently, resolving conflicts.
 * Example: cn('px-2 py-1', condition && 'bg-blue-500', 'px-4')
 *       => 'py-1 bg-blue-500 px-4' (px-4 wins over px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
