
import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, id, name, value, onChange, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={containerClassName}>
      {label && <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="date"
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
};
