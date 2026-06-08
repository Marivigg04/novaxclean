import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollArea from '@/shared/ScrollArea';

export default function RoundedSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar',
  className = '',
  align = 'left',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const selectedLabel = useMemo(() => {
    const match = options.find((option) => option.value === value);
    return match?.label ?? placeholder;
  }, [options, placeholder, value]);

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  const handleSelect = (optionValue, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
        className="inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm text-[var(--color-base-text)] outline-none transition-colors hover:bg-[var(--color-app-panel-hover)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div
          className={`absolute z-20 mt-2 w-full rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_24px_60px_-28px_rgba(16,32,58,0.45)] ${alignmentClass}`}
        >
          <ScrollArea className="max-h-72 p-2">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(event) => handleSelect(option.value, event)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-app-panel-hover)] ${
                    isSelected ? 'bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--color-base-text)]' : 'text-[var(--color-base-text)]/80'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" /> : null}
                </button>
              );
            })}
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
