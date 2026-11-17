export function gcToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdnToEc(jdn: number): { year: number; month: number; day: number } {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export const ETHIOPIAN_MONTH_NAMES_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

export function formatGcToEc(gcDateStr: string): string {
  try {
    if (!gcDateStr || typeof gcDateStr !== 'string') return gcDateStr;
    const parts = gcDateStr.split('-');
    if (parts.length !== 3) return gcDateStr;
    const [y, m, d] = parts.map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d) || y <= 0 || m <= 0 || d <= 0) return gcDateStr;
    const jdn = gcToJdn(y, m, d);
    const ec = jdnToEc(jdn);
    return `${ec.year}-${String(ec.month).padStart(2, '0')}-${String(ec.day).padStart(2, '0')}`;
  } catch {
    return gcDateStr;
  }
}

export function getTodayGcAndEc(): { gc: string; ec: string; ecFormattedEn: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const gc = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const ecStr = formatGcToEc(gc);
  const [ey, em, ed] = ecStr.split('-').map(Number);
  const mIdx = em - 1;
  return {
    gc,
    ec: ecStr,
    ecFormattedEn: `${ETHIOPIAN_MONTH_NAMES_EN[mIdx] || ''} ${ed}, ${ey} E.C.`
  };
}
