import React, { useState, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCw,
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { btn, pill, statusTone } from '../ui/theme';
import {
  ParsedRegistrationRow,
  readSpreadsheetFile,
  downloadRegistrationTemplate,
} from '../../utils/excel-import';

interface BatchRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ManualRow {
  id: string;
  fullName: string;
  department: string;
  employeeId?: string;
  phone?: string;
  shiftPreference: 'MORNING' | 'LUNCH' | 'EVENING' | 'ANY';
}

export const BatchRegisterModal: React.FC<BatchRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRegistrationRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual Entry State
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    { id: '1', fullName: '', department: '', employeeId: '', phone: '', shiftPreference: 'ANY' },
    { id: '2', fullName: '', department: '', employeeId: '', phone: '', shiftPreference: 'ANY' },
    { id: '3', fullName: '', department: '', employeeId: '', phone: '', shiftPreference: 'ANY' },
  ]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile?: File | null) => {
    if (!selectedFile) return;
    setErrorMsg(null);
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const rows = await readSpreadsheetFile(selectedFile);
      if (rows.length === 0) {
        setErrorMsg('No valid data rows found in the uploaded file. Please check headings.');
        setParsedRows([]);
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read file. Please verify it is a valid .xlsx or .csv.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manual Entry Helpers
  const addManualRow = () => {
    setManualRows([
      ...manualRows,
      {
        id: String(Date.now()),
        fullName: '',
        department: '',
        employeeId: '',
        phone: '',
        shiftPreference: 'ANY',
      },
    ]);
  };

  const removeManualRow = (index: number) => {
    if (manualRows.length <= 1) return;
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const updateManualRow = (index: number, field: keyof ManualRow, val: string) => {
    const updated = [...manualRows];
    updated[index] = { ...updated[index], [field]: val };
    setManualRows(updated);
  };

  // Submit Handler for File Import
  const handleImportParsedFile = async () => {
    setErrorMsg(null);
    const validRows = parsedRows.filter((r) => r.isValid);

    if (validRows.length === 0) {
      setErrorMsg('No valid records to import. Please ensure Full Name and Department are populated.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        registrations: validRows.map((r, idx) => ({
          employeeId: r.employeeId?.trim() || `EMP-BATCH-${Date.now().toString().slice(-5)}-${idx + 1}`,
          fullName: r.fullName.trim(),
          department: r.department.trim(),
          phone: r.phone?.trim() || undefined,
          shiftPreference: r.shiftPreference,
          registrationSource: 'SPREADSHEET_IMPORT',
          signatureConfirmed: true,
        })),
      };

      await apiRequest('/registrations/batch', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'File import failed. Please check records and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler for Manual Paper Entry
  const handleSaveManualBatch = async () => {
    setErrorMsg(null);
    const validRows = manualRows.filter((r) => r.fullName.trim() && r.department.trim());

    if (validRows.length === 0) {
      setErrorMsg('Please enter at least one valid staff member with Name and Department.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        registrations: validRows.map((r, idx) => ({
          employeeId: r.employeeId?.trim() || `EMP-MANUAL-${Date.now().toString().slice(-5)}-${idx + 1}`,
          fullName: r.fullName.trim(),
          department: r.department.trim(),
          phone: r.phone?.trim() || undefined,
          shiftPreference: r.shiftPreference,
          registrationSource: 'PAPER_BATCH',
          signatureConfirmed: true,
        })),
      };

      await apiRequest('/registrations/batch', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const validParsedCount = parsedRows.filter((r) => r.isValid).length;
  const invalidParsedCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-[#00843D] to-moa-gold shrink-0"></div>

        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-[#00843D] rounded-xl border border-emerald-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Staff Gym Intake & Spreadsheet Import
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk register staff members from an Excel / CSV spreadsheet or paper form roster.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Import File vs Manual Paper Entry */}
        <div className="border-b border-slate-200 bg-white px-6 pt-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-[#00843D] text-[#00843D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import from CSV / Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'manual'
                  ? 'border-[#00843D] text-[#00843D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual Paper Form Entry</span>
            </button>
          </div>

          {activeTab === 'upload' && (
            <button
              type="button"
              onClick={downloadRegistrationTemplate}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 pb-2.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template (.csv)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs min-h-0">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: CSV / Excel Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!file ? (
                /* Dropzone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                    isDragOver
                      ? 'border-[#00843D] bg-emerald-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-emerald-700 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Choose an Excel (.xlsx) or CSV file
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Drag and drop your spreadsheet here or click to browse. Supports official MoA staff sheets with English or Amharic headers.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">.xlsx</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">.csv</span>
                  </div>
                </div>
              ) : (
                /* Parsed File Preview */
                <div className="space-y-3">
                  {/* Summary Bar */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#00843D]" />
                      <span className="font-bold text-slate-900">{file.name}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600">{parsedRows.length} rows read</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {validParsedCount} Valid
                      </span>

                      {invalidParsedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {invalidParsedCount} Skipped
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer ml-2"
                      >
                        Change File
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                          <th className="py-2.5 px-3 w-12 text-center">Row</th>
                          <th className="py-2.5 px-3">Full Name</th>
                          <th className="py-2.5 px-3">Directorate / Department</th>
                          <th className="py-2.5 px-3 w-32">Employee ID</th>
                          <th className="py-2.5 px-3 w-28">Phone</th>
                          <th className="py-2.5 px-3 w-28">Shift</th>
                          <th className="py-2.5 px-3 w-28 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedRows.map((r) => (
                          <tr
                            key={r.rowNumber}
                            className={`transition-colors ${
                              r.isValid ? 'hover:bg-slate-50/80' : 'bg-red-50/40 hover:bg-red-50/60'
                            }`}
                          >
                            <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                              {r.rowNumber}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {r.fullName || <span className="text-red-500 italic">Missing Name</span>}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {r.department || <span className="text-red-500 italic">Missing Directorate</span>}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {r.employeeId || <span className="text-slate-400 italic">Auto-generate</span>}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {r.phone || '—'}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {r.shiftPreference}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {r.isValid ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Ready
                                </span>
                              ) : (
                                <span
                                  title={r.validationError}
                                  className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 cursor-help"
                                >
                                  {r.validationError || 'Invalid'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Manual Paper Form Entry */}
          {activeTab === 'manual' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                      <th className="py-2.5 px-3 w-12 text-center">No.</th>
                      <th className="py-2.5 px-3">Full Name *</th>
                      <th className="py-2.5 px-3">Directorate / Department *</th>
                      <th className="py-2.5 px-3 w-32">Employee ID</th>
                      <th className="py-2.5 px-3 w-32">Phone</th>
                      <th className="py-2.5 px-3 w-32">Shift</th>
                      <th className="py-2.5 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {manualRows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="e.g. Abebe Kebede"
                            value={row.fullName}
                            onChange={(e) => updateManualRow(index, 'fullName', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 font-medium"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="e.g. Agronomy Directorate"
                            value={row.department}
                            onChange={(e) => updateManualRow(index, 'department', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="EMP-MOA-..."
                            value={row.employeeId || ''}
                            onChange={(e) => updateManualRow(index, 'employeeId', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="+251 9..."
                            value={row.phone || ''}
                            onChange={(e) => updateManualRow(index, 'phone', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={row.shiftPreference}
                            onChange={(e) => updateManualRow(index, 'shiftPreference', e.target.value as any)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-600 bg-white"
                          >
                            <option value="MORNING">Morning (11:00 – 1:30)</option>
                            <option value="EVENING">Evening (11:30 – 3:00)</option>
                            <option value="ANY">Flexible / Any</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeManualRow(index)}
                            disabled={manualRows.length <= 1}
                            className="text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addManualRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another Row</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 h-9 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-[6px] font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'upload' ? (
            <button
              type="button"
              onClick={handleImportParsedFile}
              disabled={submitting || isParsing || validParsedCount === 0}
              className={btn.primary}
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Import {validParsedCount > 0 ? `${validParsedCount} Registrations` : 'Spreadsheet'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveManualBatch}
              disabled={submitting}
              className={btn.primary}
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving Roster...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Save Batch Roster</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
