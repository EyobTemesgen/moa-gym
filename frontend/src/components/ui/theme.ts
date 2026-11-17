/**
 * One look for every page, aligned with the MoA Design Standard (Asset Tracking System).
 * MoA green (#00843D) is the primary action color; other colors describe status.
 */

/** Button styles */
export const btn = {
  /** Main action of a page, e.g. "Register Staff", "Save" */
  primary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00843D] hover:bg-[#0B6B3A] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-[13px] rounded-[4px] shadow-[0_1px_2px_rgba(16,24,40,0.12)] transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
  /** Second action next to the main one, e.g. "Print Roster", "Export CSV" */
  secondary:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-semibold text-[13px] rounded-[4px] transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
  /** Small action inside a table row: Edit, Status, Print */
  row: 'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs',
  /** Icon inside a row action */
  rowIcon: 'w-3.5 h-3.5 text-emerald-700',
  /** Row action that isn't available */
  rowLocked:
    'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-200 rounded-[4px] text-xs font-semibold cursor-not-allowed whitespace-nowrap',
  /** Active tab in a page's tab switcher */
  tabActive: 'bg-[#00843D] text-white shadow-xs font-semibold',
  tabInactive: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium',
} as const;

/** Table styles */
export const table = {
  /** Table wrapper card */
  card: 'bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden',
  /** Header row: small semi-bold labels on a light background */
  headRow: 'bg-slate-100/90 border-b border-slate-200 text-left text-[12px] font-semibold text-slate-700 tracking-wide',
  /** Body row with hover transition */
  row: 'hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-slate-800 text-[13px]',
  /** Row just highlighted / selected */
  rowHighlight: 'bg-emerald-50/80 border-l-4 border-emerald-600',
  /** Item / employee code: quiet secondary line */
  code: 'text-xs text-slate-500 font-mono tabular-nums',
  /** Actions column header, pinned to right */
  actionsHead: 'sticky right-0 z-[1] bg-slate-100/95 w-24 text-right px-4 py-2.5',
  /** Actions column cell, pinned to right with subtle shadow */
  actionsCell: 'sticky right-0 z-[1] bg-white w-24 text-right whitespace-nowrap shadow-[-10px_0_10px_-10px_rgba(15,23,42,0.12)] px-4 py-2.5',
  /** Search box above a table */
  search:
    'w-full pl-9 pr-8 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-[4px] text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-colors',
} as const;

/** Status colors, shared by every badge and chip */
export type StatusTone = 'active' | 'suspended' | 'pending' | 'morning' | 'lunch' | 'evening' | 'neutral';

export const statusTone: Record<StatusTone, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  morning: 'bg-amber-50 text-amber-900 border-amber-200',
  lunch: 'bg-sky-50 text-sky-900 border-sky-200',
  evening: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

/** Shape shared by status badges */
export const pill = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap';
