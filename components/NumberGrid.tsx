
import React from 'react';

interface NumberGridProps {
  selected: number[];
  onChange: (numbers: number[]) => void;
  disabled?: boolean;
  maxRange: number;
  limit: number;
}

export const NumberGrid: React.FC<NumberGridProps> = ({ selected, onChange, disabled, maxRange, limit }) => {
  const toggleNumber = (num: number) => {
    if (disabled) return;
    if (selected.includes(num)) {
      onChange(selected.filter(n => n !== num));
    } else if (selected.length < limit) {
      onChange([...selected, num]);
    }
  };

  const numbers = Array.from({ length: maxRange }, (_, i) => i + 1);

  return (
    <div className={`grid gap-2 ${maxRange > 30 ? 'grid-cols-6 sm:grid-cols-10' : 'grid-cols-5'}`}>
      {numbers.map(num => (
        <button
          key={num}
          type="button"
          onClick={() => toggleNumber(num)}
          disabled={disabled}
          className={`
            h-10 w-10 sm:h-12 sm:w-12 rounded-full font-black flex items-center justify-center transition-all text-xs
            ${selected.includes(num) 
              ? 'bg-current text-white shadow-lg scale-110' 
              : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}
            ${disabled && !selected.includes(num) ? 'opacity-30 cursor-not-allowed' : ''}
          `}
          style={{ color: selected.includes(num) ? 'white' : 'inherit' }}
        >
          {num.toString().padStart(2, '0')}
        </button>
      ))}
    </div>
  );
};
