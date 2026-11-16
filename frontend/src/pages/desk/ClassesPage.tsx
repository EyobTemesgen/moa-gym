import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  X,
} from 'lucide-react';

interface WellnessClassItem {
  id: string;
  title: string;
  instructorName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isFull: boolean;
  isBookedByMe: boolean;
  participants: Array<{
    bookingId: string;
    fullName: string;
    employeeId: string;
    department: string;
  }>;
}

interface EquipmentIssueItem {
  id: string;
  equipmentName: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedAt: string;
}

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'classes' | 'equipment'>('classes');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);

  // New Class Form
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('06:30');
  const [newEndTime, setNewEndTime] = useState('07:30');
  const [newCapacity, setNewCapacity] = useState(15);

  // New Issue Form
  const [equipmentName, setEquipmentName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  // Fetch Classes
  const { data: classes, isLoading: isClassesLoading } = useQuery<WellnessClassItem[]>({
    queryKey: ['wellnessClasses'],
    queryFn: () => apiRequest('/wellness/classes'),
  });

  // Fetch Equipment Issues
  const { data: issues, isLoading: isIssuesLoading } = useQuery<EquipmentIssueItem[]>({
    queryKey: ['equipmentIssues'],
    queryFn: () => apiRequest('/wellness/equipment-issues'),
  });

  // Book/Cancel Mutation
  const bookMutation = useMutation({
    mutationFn: (classId: string) =>
      apiRequest(`/wellness/classes/${classId}/book`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessClasses'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err: any) => alert(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (classId: string) =>
      apiRequest(`/wellness/classes/${classId}/book`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessClasses'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  // Create Class Mutation
  const createClassMutation = useMutation({
    mutationFn: () =>
      apiRequest('/wellness/classes', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          instructorName: newInstructor,
          scheduledDate: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          capacity: Number(newCapacity),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessClasses'] });
      setShowAddClassModal(false);
      setNewTitle('');
      setNewInstructor('');
    },
    onError: (err: any) => alert(err.message),
  });

  // Report Issue Mutation
  const reportIssueMutation = useMutation({
    mutationFn: () =>
      apiRequest('/wellness/equipment-issues', {
        method: 'POST',
        body: JSON.stringify({
          equipmentName,
          description: issueDescription,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentIssues'] });
      setShowReportIssueModal(false);
      setEquipmentName('');
      setIssueDescription('');
    },
    onError: (err: any) => alert(err.message),
  });

  // Resolve Issue Mutation
  const resolveIssueMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/wellness/equipment-issues/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentIssues'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Wellness Classes & Equipment Care
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Group fitness schedule, spot reservations, and gym apparatus maintenance log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-white text-moa-green shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Classes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('equipment')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'equipment'
                  ? 'bg-white text-moa-green shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Equipment Log
            </button>
          </div>

          {activeTab === 'classes' && (user?.role === 'GYM_ATTENDANT' || user?.role === 'HR_ADMIN') && (
            <button
              type="button"
              onClick={() => setShowAddClassModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Class</span>
            </button>
          )}

          {activeTab === 'equipment' && (
            <button
              type="button"
              onClick={() => setShowReportIssueModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>Report Equipment Fault</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'classes' ? (
        // Classes Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classes || []).map((cls) => {
            const isFull = cls.isFull;
            const isMine = cls.isBookedByMe;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-moa-green/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-moa-green uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {cls.instructorName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isFull
                          ? 'bg-red-50 text-moa-danger border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cls.bookedCount} / {cls.capacity} spots
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{cls.title}</h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(cls.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {cls.startTime} - {cls.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {isMine ? (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(cls.id)}
                      disabled={cancelMutation.isPending}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-moa-danger border border-red-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancel My Booking
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bookMutation.mutate(cls.id)}
                      disabled={isFull || bookMutation.isPending}
                      className={`w-full py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                        isFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-moa-green hover:bg-moa-green-dark text-white shadow-xs'
                      }`}
                    >
                      {isFull ? 'Class Full' : 'Reserve Spot'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Equipment Maintenance Tab
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Reported Equipment Maintenance Log</h3>
            <p className="text-xs text-slate-500">
              Staff and attendants can log damaged gym machinery to alert facility maintenance technicians.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {(issues || []).map((issue) => (
              <div
                key={issue.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{issue.equipmentName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : issue.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-moa-danger'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{issue.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Reported on {new Date(issue.reportedAt).toLocaleString()}
                  </p>
                </div>

                {(user?.role === 'GYM_ATTENDANT' || user?.role === 'HR_ADMIN') && (
                  <div className="flex items-center gap-2">
                    {issue.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() =>
                          resolveIssueMutation.mutate({ id: issue.id, status: 'RESOLVED' })
                        }
                        className="px-3 py-1 bg-emerald-50 text-moa-green border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Schedule Group Wellness Class</h3>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Core & Cardio"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructor / Trainer
                </label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="e.g. Coach Henok"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => createClassMutation.mutate()}
                disabled={!newTitle.trim() || !newInstructor.trim() || createClassMutation.isPending}
                className="px-4 py-2 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg transition"
              >
                Schedule Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Report Broken Gym Equipment</h3>
              <button
                type="button"
                onClick={() => setShowReportIssueModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment / Machine Name
                </label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="e.g. Stationary Bike #02 or Cable Machine"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description of Malfunction
                </label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the issue, noise, safety hazard..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
                ></textarea>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportIssueModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => reportIssueMutation.mutate()}
                disabled={!equipmentName.trim() || !issueDescription.trim() || reportIssueMutation.isPending}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
