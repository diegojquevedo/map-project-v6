import React from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  className = ''
}) => {
  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClear()}
        placeholder={placeholder}
        style={{
          width: '100%',
          border: '1px solid #000',
          background: '#fff',
          padding: '8px 32px 8px 12px',
          fontSize: '14px',
          color: '#000',
          outline: 'none'
        }}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#666',
            fontSize: '18px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: 0
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
