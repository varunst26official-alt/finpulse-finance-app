import React, { useState, useEffect } from 'react';
import { Currency } from '@/types/finance';
import { formatExactAmountText, cleanNumericInputString } from '@/utils/formatters';

export interface NumericAmountInputProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string | number;
  value: number | string;
  onChange: (value: number) => void;
  currency?: Currency;
  isCurrency?: boolean;
  unitText?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  hint?: string;
  'data-testid'?: string;
}

export const NumericAmountInput: React.FC<NumericAmountInputProps> = ({
  id,
  name,
  label,
  required = false,
  min: _min = 0,
  max: _max,
  step: _step = 'any',
  value,
  onChange,
  currency = 'INR',
  isCurrency = true,
  unitText,
  placeholder = '0',
  className = '',
  inputClassName = '',
  disabled = false,
  autoFocus = false,
  hint,
  'data-testid': testId,
}) => {
  // Local string state to handle typing smoothly without React number-input glitching
  const [displayStr, setDisplayStr] = useState<string>(() => {
    if (value === '' || value === undefined || value === null) return '';
    return cleanNumericInputString(value);
  });

  // Synchronize when external value changes
  useEffect(() => {
    const cleaned = cleanNumericInputString(value);
    // Only update if mathematically different to avoid cursor jumps while typing
    const currentNum = parseFloat(displayStr) || 0;
    const incomingNum = parseFloat(cleaned) || 0;
    if (currentNum !== incomingNum) {
      setDisplayStr(cleaned === '0' && !value ? '' : cleaned);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // 1. Immediately remove preceding zeros: "0150000" -> "150000"
    let cleaned = cleanNumericInputString(raw);

    // 2. Only allow valid numeric characters (digits and optional decimal)
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    setDisplayStr(cleaned);

    const num = cleaned === '' ? 0 : parseFloat(cleaned);
    onChange(isNaN(num) ? 0 : num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // When focusing a field that is '0', select all so user typing immediately overwrites it
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  const handleBlur = () => {
    if (displayStr !== '') {
      const cleaned = cleanNumericInputString(displayStr);
      setDisplayStr(cleaned);
    }
  };

  const numericVal = parseFloat(displayStr) || 0;

  // Render exact amount text below
  const renderExactAmountText = () => {
    if (numericVal <= 0 && displayStr === '') {
      return null;
    }

    if (isCurrency) {
      return (
        <span className="font-mono font-bold text-[#9e783e]">
          {formatExactAmountText(numericVal, currency)}
        </span>
      );
    }

    if (unitText) {
      return (
        <span className="font-semibold text-slate-600">
          {numericVal.toLocaleString()} {unitText}
        </span>
      );
    }

    return (
      <span className="font-mono font-semibold text-slate-600">
        {numericVal.toLocaleString()}
      </span>
    );
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-slate-600 font-semibold text-xs">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          data-testid={testId}
          value={displayStr}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden transition-colors ${inputClassName}`}
        />
      </div>

      {/* Exact Amount Text Below the Field */}
      <div className="flex items-center justify-between text-[11px] min-h-[16px] px-1">
        <div className="flex items-center gap-1.5">
          {renderExactAmountText()}
        </div>
        {hint && <span className="text-[10px] text-slate-400 font-normal">{hint}</span>}
      </div>
    </div>
  );
};
