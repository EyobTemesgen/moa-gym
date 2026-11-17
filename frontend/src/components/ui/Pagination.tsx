import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const PAGE_SIZES = [10, 25, 50, 100];

export interface Pager<T> {
  pageItems: T[];
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  from: number;
  to: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(items: T[], options: { pageSize?: number; resetKey?: unknown } = {}): Pager<T> {
  const [pageSize, setPageSizeState] = useState(options.pageSize ?? PAGE_SIZES[0]);
  const [page, setPageState] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPageState(1);
  }, [options.resetKey]);

  const current = Math.min(page, pageCount);
  useEffect(() => {
    if (page !== current) setPageState(current);
  }, [page, current]);

  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize]
  );

  return {
    pageItems,
    page: current,
    pageCount,
    pageSize,
    total,
    from: total === 0 ? 0 : (current - 1) * pageSize + 1,
    to: Math.min(current * pageSize, total),
    setPage: (p) => setPageState(Math.min(Math.max(1, p), pageCount)),
    setPageSize: (size) => {
      setPageSizeState(size);
      setPageState(1);
    },
  };
}

export function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => wanted.add(p));
  if (page >= pageCount - 2) [pageCount - 1, pageCount - 2, pageCount - 3].forEach((p) => wanted.add(p));
  const pages = [...wanted].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const navButton =
  'flex h-8 min-w-8 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 cursor-pointer';

interface PaginationProps {
  pager: Pager<unknown>;
  label?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ pager, label = 'records', className = '' }) => {
  const { page, pageCount, pageSize, total, from, to, setPage, setPageSize } = pager;
  if (total === 0) return null;

  return (
    <nav
      aria-label={`Pages of ${label}`}
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 ${className}`}
    >
      <p aria-live="polite">
        Showing <span className="font-semibold tabular-nums text-slate-900">{from}–{to}</span> of{' '}
        <span className="font-semibold tabular-nums text-slate-900">{total.toLocaleString()}</span> {label}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-[4px] border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1}
            title="First page"
            className={navButton}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            title="Previous page"
            className={navButton}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {pageWindow(page, pageCount).map((p, idx) =>
            p === 'gap' ? (
              <span key={`gap-${idx}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-[4px] px-2 text-xs font-semibold transition cursor-pointer ${
                  p === page
                    ? 'bg-[#00843D] text-white shadow-2xs'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page === pageCount}
            title="Next page"
            className={navButton}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPage(pageCount)}
            disabled={page === pageCount}
            title="Last page"
            className={navButton}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
