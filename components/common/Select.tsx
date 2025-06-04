import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

// Omit 'placeholder' from React.SelectHTMLAttributes as it's not a valid attribute for <select>
// Instead, we handle it manually by adding an <option> element.
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string; // Custom prop for the placeholder text of the first disabled option
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  id, 
  name, 
  value, 
  onChange, 
  className = '', 
  containerClassName = '', 
  placeholder, // Destructure our custom placeholder prop
  ...restProps // Keep other valid select attributes
}) => {
  return (
    <div className={containerClassName}>
      {label && <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm ${className}`}
        {...restProps} // Spread the remaining valid HTMLSelectElement attributes
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};
