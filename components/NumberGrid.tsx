
import React from 'react';

interface NumberGridProps {
  selected: number[];
  onChange: (numbers: number[]) => void;
  disabled?: boolean;
}

export const NumberGrid: React.FC<NumberGridProps> = ({ selected, onChange, disabled }) => {
  const toggleNumber = (num: number) => {
    if (disabled) return;
    if (selected.includes(num)) {
      onChange(selected.filter(n => n !== num));
    } else if (selected.length < 18) {
      onChange([...selected, num]);
    }
  };

  const numbers = Array.from({ length: 60 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
      {numbers.map(num => (
        <button
          key={num}
          onClick={() => toggleNumber(num)}
          disabled={disabled}
          className={`
            h-10 w-10 sm:h-12 sm:w-12 rounded-full font-bold flex items-center justify-center transition-all
            ${selected.includes(num) 
              ? 'bg-emerald-600 text-white shadow-lg scale-110' 
              : 'bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-50'}
            ${disabled && !selected.includes(num) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {num.toString().padStart(2, '0')}
        </button>
      ))}
    </div>
  );
};
