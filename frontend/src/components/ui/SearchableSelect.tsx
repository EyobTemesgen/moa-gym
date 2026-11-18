import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Shown after the label in a lighter colour, e.g. a role or department */
  note?: string;
  /** Listed, but can't be picked */
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SearchableSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  groups: SelectGroup[];
  placeholder?: string;
  searchPlaceholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

/**
 * Searchable select component matching the official MoA Asset Tracking System (ATS) design.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  value,
  onChange,
  groups,
  placeholder = 'Select an employee…',
  searchPlaceholder = 'Search by name, employee ID, or directorate…',
  autoFocus,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => groups.flatMap((g) => g.options).find((o) => o.value === value),
    [groups, value],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        options: q
          ? g.options.filter((o) => `${o.label} ${o.note ?? ''}`.toLowerCase().includes(q))
          : g.options,
      }))
      .filter((g) => g.options.length > 0);
  }, [groups, query]);

  const pickable = useMemo(
    () => shown.flatMap((g) => g.options).filter((o) => !o.disabled),
    [shown],
  );

  const close = (refocus = true) => {
    setOpen(false);
    setQuery('');
    if (refocus) buttonRef.current?.focus();
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    close();
  };

  useEffect(() => setActive(0), [query, open]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep highlighted option in view
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (pickable.length > 0) {
        setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + pickable.length) % pickable.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (pickable[active]) choose(pickable[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  const total = shown.reduce((n, g) => n + g.options.length, 0);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        autoFocus={autoFocus}
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex ${compact ? 'h-9' : 'h-10'} w-full items-center justify-between gap-2 rounded-xl border border-slate-300 hover:border-slate-500 focus:border-moa-green focus:ring-2 focus:ring-moa-green/20 bg-white px-3 text-left text-xs transition-colors focus:outline-none cursor-pointer shadow-2xs`}
      >
        <span className={`truncate ${selected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95">
          <div className="relative border-b border-slate-200 p-2 bg-slate-50">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id={`${id}-search`}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKey}
              placeholder={searchPlaceholder}
              aria-label="Search employee list"
              autoComplete="off"
              className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-moa-green focus:ring-1 focus:ring-moa-green focus:outline-none"
            />
          </div>
          <ul id={`${id}-list`} ref={listRef} role="listbox" className="max-h-60 overflow-y-auto p-1 text-xs divide-y divide-slate-100">
            {total === 0 && (
              <li className="px-3 py-4 text-center text-xs text-slate-500">
                No matching employees found for "{query}".
              </li>
            )}
            {shown.map((group) => (
              <li key={group.label} role="presentation" className="pt-1.5 first:pt-0">
                <p className="px-2.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label} ({group.options.length})
                </p>
                <ul role="group" aria-label={group.label} className="space-y-0.5">
                  {group.options.map((option) => {
                    const isActive = !option.disabled && pickable[active]?.value === option.value;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={option.value === value}
                        aria-disabled={option.disabled || undefined}
                        data-active={isActive}
                        onMouseEnter={() => !option.disabled && setActive(pickable.findIndex((o) => o.value === option.value))}
                        onClick={() => choose(option)}
                        className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                          option.disabled
                            ? 'cursor-not-allowed opacity-50 bg-slate-50/50 text-slate-400'
                            : `cursor-pointer ${isActive ? 'bg-emerald-50 text-moa-green font-semibold' : 'text-slate-800 hover:bg-slate-50'}`
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="truncate block font-medium">{option.label}</span>
                          {option.note && (
                            <span className="text-[10px] text-slate-400 block truncate">{option.note}</span>
                          )}
                        </div>
                        {option.value === value && <Check className="h-4 w-4 shrink-0 text-moa-green" />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
