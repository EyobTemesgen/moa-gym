import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { Settings, Save, CheckCircle2, ShieldAlert, Sliders } from 'lucide-react';

interface SystemConfigData {
  id: number;
  maxCapacity: number;
  waiverText: string;
}

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [maxCapacity, setMaxCapacity] = useState<number>(40);
  const [waiverText, setWaiverText] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: config, isLoading } = useQuery<SystemConfigData>({
    queryKey: ['systemConfig'],
    queryFn: () => apiRequest('/reports/config'),
  });

  useEffect(() => {
    if (config) {
      setMaxCapacity(config.maxCapacity);
      setWaiverText(config.waiverText);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiRequest('/reports/config', {
        method: 'PATCH',
        body: JSON.stringify({
          maxCapacity: Number(maxCapacity),
          waiverText,
        }),
      }),
    onSuccess: () => {
      setSavedSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: any) => alert(err.message),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Facility Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global capacity limit, gate safety thresholds, and legal waiver terms.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-moa-green border border-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Max Capacity */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-moa-green" />
            <span>Maximum Facility Floor Capacity</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Simultaneous active employee capacity limit. When this threshold is reached, gate verification will automatically reject new entries with code <code>GYM_AT_MAX_CAPACITY</code>.
          </p>
          <div className="max-w-xs">
            <input
              type="number"
              min={5}
              max={200}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30"
            />
          </div>
        </div>

        {/* Waiver Text */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-moa-gold" />
            <span>Official Liability Waiver & Medical Terms</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Legal agreement and terms displayed to MoA staff during mandatory first-time onboarding.
          </p>
          <textarea
            rows={12}
            value={waiverText}
            onChange={(e) => setWaiverText(e.target.value)}
            className="w-full p-4 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 leading-relaxed"
          ></textarea>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{updateMutation.isPending ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
