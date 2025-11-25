import React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 dark:placeholder:text-gray-400 dark:focus:ring-blue-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 dark:placeholder:text-gray-400 dark:focus:ring-blue-400',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
  }
>(({ className, placeholder, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn('text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children || placeholder}
    </span>
  );
});
SelectValue.displayName = 'SelectValue';

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};