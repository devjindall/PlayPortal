import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getSubmissions,
  approveSubmission,
  rejectSubmission,
} from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const fetchSubmissionsList = async () => {
    setLoading(true);
    try {
      const res = await getSubmissions({ status: statusFilter });
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsList();
  }, [statusFilter]);

  const handleApprove = async (submissionId) => {
    setActionLoading(true);
    setError('');
    setFeedback('');
    try {
      await approveSubmission(submissionId);
      setFeedback('Submission approved! The game is now published.');
      setSelectedSubmission(null);
      fetchSubmissionsList();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submissionId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    setError('');
    setFeedback('');
    try {
      await rejectSubmission(submissionId, rejectionReason);
      setFeedback('Submission rejected with reason.');
      setSelectedSubmission(null);
      setRejectionReason('');
      fetchSubmissionsList();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-2">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <ClipboardList className="w-7 h-7 text-yellow-400" />
          <span>Game Submissions Queue</span>
        </h1>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { label: 'All Submissions', value: '' },
          { label: 'Pending Review', value: 'PENDING' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Rejected', value: 'REJECTED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === tab.value
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <LoadingSpinner text="Fetching moderation queue..." />
      ) : submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const thumbnailUrl = sub.thumbnail?.startsWith('http')
              ? sub.thumbnail
              : sub.thumbnail
              ? `${backendBaseUrl}${sub.thumbnail}`
              : '/favicon.svg';

            return (
              <div
                key={sub._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={thumbnailUrl}
                    alt={sub.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/favicon.svg';
                    }}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">{sub.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-emerald-400 border border-emerald-950">
                        {sub.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Submitted by <span className="text-slate-200 font-semibold">{sub.developer?.name}</span> ({sub.developer?.email})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Date: {new Date(sub.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-auto">
                  {sub.status === 'PENDING' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-950 text-yellow-400 border border-yellow-800">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Review</span>
                    </span>
                  )}
                  {sub.status === 'APPROVED' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved</span>
                    </span>
                  )}
                  {sub.status === 'REJECTED' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setRejectionReason(sub.rejectionReason || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Inspect & Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          No submissions matching the selected filter.
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Review Game Submission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Game Title</span>
                <div className="text-sm font-bold text-white mt-0.5">{selectedSubmission.title}</div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Description</span>
                <div className="text-slate-300 mt-0.5 leading-relaxed">{selectedSubmission.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Category</span>
                  <div className="text-emerald-400 font-bold">{selectedSubmission.category}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Developer</span>
                  <div className="text-white font-medium">{selectedSubmission.developer?.name}</div>
                </div>
              </div>

              {selectedSubmission.game?.gameUrl && (
                <div className="pt-2">
                  <a
                    href={`${backendBaseUrl}${selectedSubmission.game.gameUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Playable Preview (New Tab)</span>
                  </a>
                </div>
              )}

              {/* Rejection Reason Input */}
              <div className="pt-2 space-y-1.5">
                <label className="block font-semibold text-slate-300 text-[10px] uppercase tracking-wider">
                  Rejection Reason (Required only if rejecting)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the game is being rejected..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <button
                disabled={actionLoading}
                onClick={() => handleReject(selectedSubmission._id)}
                className="py-2.5 px-4 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleApprove(selectedSubmission._id)}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
