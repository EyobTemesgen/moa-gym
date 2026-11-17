import React, { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface BatchRow {
  id: string;
  fullName: string;
  department: string;
  employeeId?: string;
  phone?: string;
  shiftPreference: string;
}

interface BatchRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchRegisterModal: React.FC<BatchRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<BatchRow[]>([
    {
      id: '1',
      fullName: '',
      department: '',
      employeeId: '',
      phone: '',
      shiftPreference: 'ANY',
    },
    {
      id: '2',
      fullName: '',
      department: '',
      employeeId: '',
      phone: '',
      shiftPreference: 'ANY',
    },
    {
      id: '3',
      fullName: '',
      department: '',
      employeeId: '',
      phone: '',
      shiftPreference: 'ANY',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addRow = () => {
    setRows([
      ...rows,
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

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof BatchRow, val: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: val };
    setRows(updated);
  };

  const handleSaveBatch = async () => {
    setErrorMsg(null);
    const validRows = rows.filter((r) => r.fullName.trim() && r.department.trim());

    if (validRows.length === 0) {
      setErrorMsg('እባክዎ ቢያንስ የአንድ ሰራተኛ ስም እና የስራ ክፍል ይሙሉ (Fill at least 1 valid row)');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue"></div>

        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>ፈጣን የቡድን ምዝገባ</span>
              <span className="text-xs font-normal text-slate-500 font-sans">
                / Quick Batch Registration from Paper Forms
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ከወረቀት ቅጽ ላይ የተመዘገቡትን ሰራተኞች በቀጥታ ረድፍ በረድፍ ወደ ስርዓቱ ያስገቡ።
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 w-12 text-center">ተ.ቁ</th>
                  <th className="py-2.5 px-3">የሰራተኛው ሙሉ ስም (Full Name) *</th>
                  <th className="py-2.5 px-3">የስራ ክፍል / ዳይሬክቶሬት (Department) *</th>
                  <th className="py-2.5 px-3 w-32">መለያ ቁ. (ID)</th>
                  <th className="py-2.5 px-3 w-32">ስልክ (Phone)</th>
                  <th className="py-2.5 px-3 w-32">ሰዓት (Shift)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-center font-bold text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        placeholder="ምሳሌ፡ ኤርሚያስ ተሾመ"
                        value={row.fullName}
                        onChange={(e) => updateRow(idx, 'fullName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-moa-green"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        placeholder="ምሳሌ፡ ጥራት ግብዓት"
                        value={row.department}
                        onChange={(e) => updateRow(idx, 'department', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-moa-green"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        placeholder="EMP-..."
                        value={row.employeeId}
                        onChange={(e) => updateRow(idx, 'employeeId', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-moa-green"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        placeholder="09..."
                        value={row.phone}
                        onChange={(e) => updateRow(idx, 'phone', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-moa-green"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <select
                        value={row.shiftPreference}
                        onChange={(e) => updateRow(idx, 'shiftPreference', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-moa-green"
                      >
                        <option value="ANY">ማንኛውም</option>
                        <option value="MORNING">ጠዋት</option>
                        <option value="LUNCH">ምሳ</option>
                        <option value="EVENING">ማታ</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        disabled={rows.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        title="ረድፍ ሰርዝ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-semibold cursor-pointer"
            >
              <Plus className="h-4 w-4 text-moa-green" />
              <span>ተጨማሪ ረድፍ ጨምር (Add Row)</span>
            </button>

            <span className="text-slate-500 font-medium">
              ድምር ረድፎች፡ {rows.length} ({rows.filter((r) => r.fullName.trim() && r.department.trim()).length} ዝግጁ)
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
            >
              ሰርዝ (Cancel)
            </button>

            <button
              type="button"
              onClick={handleSaveBatch}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-moa-green hover:bg-moa-green-dark text-white rounded-xl font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'በማስቀመጥ ላይ...' : 'ሁሉንም መዝግብ (Save All)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
