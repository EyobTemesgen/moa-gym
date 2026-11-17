import { readSheet } from 'read-excel-file/browser';

export interface ParsedRegistrationRow {
  rowNumber: number;
  fullName: string;
  department: string;
  employeeId?: string;
  phone?: string;
  shiftPreference: 'MORNING' | 'LUNCH' | 'EVENING' | 'ANY';
  isValid: boolean;
  validationError?: string;
}

/** Robust CSV parser handling quotes, commas, and linebreaks (RFC 4180) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  const body = text.replace(/^\uFEFF/, ''); // strip BOM if present

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"' && body[i + 1] === '"') {
        value += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        value += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(value.trim());
      value = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && body[i + 1] === '\n') i++;
      row.push(value.trim());
      if (row.some((c) => c !== '')) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += ch;
    }
  }

  if (value !== '' || row.length > 0) {
    row.push(value.trim());
    if (row.some((c) => c !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

const normalize = (v: unknown): string =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[()_.:/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function matchColumn(header: string): string | null {
  const h = normalize(header);
  if (!h) return null;

  if (
    h.includes('name') ||
    h.includes('ሙሉ ስም') ||
    h === 'ስም' ||
    h.includes('staff name') ||
    h.includes('employee name')
  ) {
    return 'fullName';
  }

  if (
    h.includes('department') ||
    h.includes('directorate') ||
    h.includes('dept') ||
    h.includes('የስራ ክፍል') ||
    h.includes('የሥራ ክፍል') ||
    h.includes('ዋና የስራ ክፍል') ||
    h.includes('ዳይሬክቶሬት') ||
    h === 'ክፍል'
  ) {
    return 'department';
  }

  if (
    h.includes('employee id') ||
    h.includes('payroll id') ||
    h.includes('staff id') ||
    h.includes('id no') ||
    h.includes('የሰራተኛ መለያ') ||
    h.includes('የሠራተኛ መለያ') ||
    h.includes('መለያ ቁጥር') ||
    h === 'id' ||
    h === 'employeeid'
  ) {
    return 'employeeId';
  }

  if (
    h.includes('phone') ||
    h.includes('mobile') ||
    h.includes('tel') ||
    h.includes('ስልክ') ||
    h.includes('ስልክ ቁጥር')
  ) {
    return 'phone';
  }

  if (
    h.includes('shift') ||
    h.includes('ፈረቃ') ||
    h.includes('የፈረቃ') ||
    h.includes('time') ||
    h.includes('schedule')
  ) {
    return 'shiftPreference';
  }

  return null;
}

function normalizeShift(raw?: string): 'MORNING' | 'LUNCH' | 'EVENING' | 'ANY' {
  if (!raw) return 'ANY';
  const s = raw.toLowerCase().trim();
  if (s.includes('morn') || s.includes('ጠዋት') || s.includes('ማለዳ') || s.includes('11') || s.includes('05') || s.includes('06')) return 'MORNING';
  if (s.includes('even') || s.includes('ማታ') || s.includes('ምሽት') || s.includes('03') || s.includes('17') || s.includes('21')) return 'EVENING';
  return 'ANY';
}

/** Parses raw string grid into structured registration rows with header detection */
export function processRawGrid(grid: unknown[][]): ParsedRegistrationRow[] {
  if (!grid || grid.length === 0) return [];

  // Find header row in first 10 rows
  let headerIndex = -1;
  let colMap = new Map<number, string>();

  for (let i = 0; i < Math.min(grid.length, 10); i++) {
    const row = grid[i];
    const candidateMap = new Map<number, string>();

    row.forEach((cell, idx) => {
      const match = matchColumn(String(cell));
      if (match && ![...candidateMap.values()].includes(match)) {
        candidateMap.set(idx, match);
      }
    });

    if (candidateMap.has([...candidateMap.entries()].find(([_, v]) => v === 'fullName')?.[0] ?? -1) || candidateMap.size >= 2) {
      headerIndex = i;
      colMap = candidateMap;
      break;
    }
  }

  // If no header found, default to standard order: 0: Name, 1: Dept, 2: ID, 3: Phone, 4: Shift
  if (headerIndex === -1) {
    headerIndex = 0;
    colMap.set(0, 'fullName');
    colMap.set(1, 'department');
    colMap.set(2, 'employeeId');
    colMap.set(3, 'phone');
    colMap.set(4, 'shiftPreference');
  }

  const results: ParsedRegistrationRow[] = [];
  const dataRows = grid.slice(headerIndex + 1);

  dataRows.forEach((r, idx) => {
    // Skip totally empty rows
    if (!r.some((c) => c !== null && c !== undefined && String(c).trim() !== '')) {
      return;
    }

    const rowObj: any = {
      fullName: '',
      department: '',
      employeeId: '',
      phone: '',
      shiftPreference: 'ANY',
    };

    colMap.forEach((field, colIdx) => {
      const val = r[colIdx];
      if (val !== null && val !== undefined) {
        rowObj[field] = String(val).trim();
      }
    });

    const fullName = String(rowObj.fullName || '').trim();
    const department = String(rowObj.department || '').trim();
    const employeeId = String(rowObj.employeeId || '').trim();
    const phone = String(rowObj.phone || '').trim();
    const shiftPreference = normalizeShift(rowObj.shiftPreference);

    let isValid = true;
    let validationError: string | undefined;

    if (!fullName) {
      isValid = false;
      validationError = 'Missing Full Name';
    } else if (!department) {
      isValid = false;
      validationError = 'Missing Directorate/Department';
    }

    results.push({
      rowNumber: headerIndex + idx + 2,
      fullName,
      department,
      employeeId: employeeId || undefined,
      phone: phone || undefined,
      shiftPreference,
      isValid,
      validationError,
    });
  });

  return results;
}

/** Reads either .xlsx (Excel) or .csv into parsed rows */
export async function readSpreadsheetFile(file: File): Promise<ParsedRegistrationRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    const grid = parseCsv(text);
    return processRawGrid(grid);
  }

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const grid = (await readSheet(file)) as unknown[][];
    return processRawGrid(grid);
  }

  throw new Error('Unsupported file format. Please upload an Excel workbook (.xlsx) or CSV (.csv) file.');
}

/** Downloads an official template CSV */
export function downloadRegistrationTemplate() {
  const headers = ['Full Name', 'Department / Directorate', 'Employee ID', 'Phone', 'Shift Preference'];
  const sampleRows = [
    ['Abebe Kebede Tessema', 'Agronomy & Crop Development', 'EMP-MOA-001', '+251 91 123 4567', 'MORNING'],
    ['Tirhas Gebremedhin', 'Agricultural Extension Directorate', 'EMP-MOA-002', '+251 92 345 6789', 'LUNCH'],
    ['Dawit Haile Wolde', 'Veterinary & Animal Health Directorate', 'EMP-MOA-003', '+251 93 456 7890', 'EVENING'],
    ['Fatima Mohammed Nur', 'Natural Resource & Soil Conservation', 'EMP-MOA-004', '+251 94 567 8901', 'Flexible'],
  ];

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'moa-gym-registration-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
