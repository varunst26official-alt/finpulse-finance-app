import React, { useState, useRef, useEffect } from 'react';

interface StepperSliderProps {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  stepIncrement?: number;
  unit?: string;
  currencyPrefix?: string;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
  presets?: number[];
  accentColor?: string;
}

export const StepperSlider: React.FC<StepperSliderProps> = ({
  label,
  sublabel,
  value,
  min = 0,
  max,
  step = 1000,
  stepIncrement,
  unit = '',
  currencyPrefix = '₹',
  formatValue,
  onChange,
  presets = [],
  accentColor = '#d97706', // Warm Amber Gold
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value > 0 ? value.toString() : '');
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = stepIncrement || (step * 5 > 1000 ? step * 5 : step);

  useEffect(() => {
    setInputValue(value > 0 ? value.toString() : '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const defaultFormatter = (val: number) => {
    if (val === 0) return `${currencyPrefix}0`;
    return `${currencyPrefix}${val.toLocaleString('en-IN')}`;
  };

  const displayFormatter = formatValue || defaultFormatter;

  const handleDecrement = () => {
    const next = Math.max(min, value - increment);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + increment);
    onChange(next);
  };

  const handleCommitInput = () => {
    const parsed = parseFloat(inputValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    } else {
      onChange(0);
    }
    setIsEditing(false);
  };

  const percent = max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div className="space-y-2 p-3 sm:p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] shadow-2xs select-none">
      {/* Header with Title and Tap-to-Type Editable Badge */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="font-bold text-xs sm:text-sm text-slate-800 block">{label}</span>
          {sublabel && <span className="text-[10px] text-slate-500 font-medium block">{sublabel}</span>}
        </div>

        <div className="relative">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 rounded-xl bg-white border border-[#e8e0d1] hover:border-amber-500 text-slate-900 font-mono font-extrabold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Tap to type exact amount"
            >
              <span>{displayFormatter(value)}{unit}</span>
              <span className="text-[10px] text-slate-400">✎</span>
            </button>
          ) : (
            <input
              ref={inputRef}
              type="number"
              min={min}
              max={max}
              step={step}
              value={inputValue}
              placeholder="0"
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleCommitInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitInput();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-28 px-2 py-1 rounded-xl border-2 border-amber-600 bg-white font-mono font-bold text-xs sm:text-sm text-right focus:outline-none shadow-md text-slate-900 z-10"
            />
          )}
        </div>
      </div>

      {/* Stepper Controls: Minus, Range Slider, Plus */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#e8e0d1] text-slate-700 hover:text-amber-700 hover:bg-amber-50 font-extrabold text-lg flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          title={`Decrease by ${displayFormatter(increment)}`}
        >
          −
        </button>

        <div className="flex-1 px-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              touchAction: 'none',
              background: `linear-gradient(to right, ${accentColor} ${percent}%, #e2e8f0 ${percent}%)`,
            }}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>{displayFormatter(min)}</span>
            <span>{displayFormatter(max)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#e8e0d1] text-slate-700 hover:text-amber-700 hover:bg-amber-50 font-extrabold text-lg flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          title={`Increase by ${displayFormatter(increment)}`}
        >
          +
        </button>
      </div>

      {/* Preset Chips (If provided) */}
      {presets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[10px] text-slate-400 shrink-0 font-medium">Quick Fill:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                value === preset
                  ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                  : 'bg-white border-[#e8e0d1] text-slate-600 hover:border-amber-400 hover:text-slate-900'
              }`}
            >
              {displayFormatter(preset)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
