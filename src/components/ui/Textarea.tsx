import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 font-['Lato']"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          <textarea
            ref={ref}
            className={`
              block w-full px-4 py-2 rounded-xl border 
              ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 
                'border-gray-300 focus:ring-[#F47D6C] focus:border-[#F47D6C]'} 
              shadow-sm focus:outline-none focus:ring-2
              font-['Lato']
              min-h-[64px] md:min-h-[80px]
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 font-['Lato']">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 