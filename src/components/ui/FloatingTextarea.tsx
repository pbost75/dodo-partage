import React, { useState } from 'react';

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  fixedLabel?: boolean;
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, id, className = '', value, onFocus, onBlur, fixedLabel = false, ...props }, ref) => {
    const inputId = id || props.name;
    const [isFocused, setIsFocused] = useState(false);
    const isFilled = value !== undefined && value !== '';
    
    // Déterminer si le label doit être en position haute
    const isLabelUp = isFocused || isFilled || fixedLabel;
    
    // Déterminer le placeholder à afficher
    const getPlaceholder = () => {
      if (fixedLabel) {
        return props.placeholder || " ";
      }
      
      // Placeholder visible seulement au focus
      if (isFocused) {
        // Si un placeholder spécifique est fourni et n'est pas vide, l'utiliser
        if (props.placeholder && props.placeholder.trim() !== "") {
          return props.placeholder;
        }
        // Sinon placeholder vide
        return " ";
      }
      
      // Quand le label est en bas, toujours un placeholder vide
      return " ";
    };
    
    return (
      <div className="relative">
        <textarea
          id={inputId}
          ref={ref}
          className={`peer block w-full border rounded-xl px-4 py-4 text-base md:text-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 leading-tight font-['Lato'] resize-none
            ${error ? 'border-red-500 focus:ring-red-200' : isFocused ? 'border-blue-500 focus:ring-blue-200' : 'border-gray-300'}
            ${fixedLabel ? 'pt-6 pb-4' : 'pt-6 pb-4'} ${className}`}
          placeholder={getPlaceholder()}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          value={value}
          onFocus={e => { setIsFocused(true); onFocus && onFocus(e); }}
          onBlur={e => { setIsFocused(false); onBlur && onBlur(e); }}
          rows={6}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-4 bg-white px-2 text-base transition-all duration-200 pointer-events-none z-10
            ${error ? 'text-red-500' : isFocused ? 'text-blue-700' : 'text-gray-500'}
            ${isLabelUp || fixedLabel ? '-top-2 -translate-y-1 scale-90' : 'top-6 -translate-y-1/2 scale-100'}
          `}
        >
          {label}
        </label>
        {error && (
          <span id={`${inputId}-error`} className="text-red-500 text-sm mt-2 block font-['Lato']">{error}</span>
        )}
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea; 